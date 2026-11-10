/**
 * SQL's expression binder (ADR 0014, step 3b): an expression of the parser (sql/ast.ts) bound to a plan expression,
 * with its names resolved, typed, and SQL's rules made explicit (comparison collations, affinity conversions, the
 * engine operation for each operator, by behaviour name). The engine compiles plan expressions.
 */
import { SmaltError } from 'smaltdb/language';
import { storageTypeFor } from 'smaltdb/language';
import type { CallExpr, ColumnExpr, Expr, SelectStmt } from '../ast.js';
import { Collation, type SqlValue, collationByName } from 'smaltdb/language';
import { type Affinity, type StaticType, affinityOfStorage, staticTypeOfStorage } from 'smaltdb/language';
import type { Catalog } from 'smaltdb/language';
import { engineName, isAggregateName, resultType, scalarFunction, takesArgs, windowFunction } from './functions.js';
import { type BoundExpr, call, lit, param, typeOf } from 'smaltdb/language';
import type { PlanOp } from 'smaltdb/language';
import { comparisonRule, engineFunctions } from 'smaltdb/language';
import { CollSrc, NO_META, type SqlMeta, collationName, metaOf, setMeaning, withMeaning } from './meaning.js';

export interface ColumnBinding {
  reg: number;
  type: StaticType;
  collation: Collation;
  affinity: Affinity;
  /**
   * Resolved with `defer`: marks the column as read (projection pushdown), for when the expression is compiled.
   * Without `defer`, resolving marks it at once.
   */
  use?: () => void;
  /** The name resolved to a select-list alias, bound by the SQL front end: use this plan expression. */
  bound?: BoundExpr;
}

/** Name resolution and planner callbacks used while compiling expressions. */
export interface CompileScope {
  /**
   * Resolve a column name. With `defer`, the column is marked as read only when the binding's `use` runs (the binder
   * calls it from compiling); scopes that don't support deferring may ignore it and mark at once.
   */
  resolveColumn(e: ColumnExpr, defer?: boolean): ColumnBinding;
  /** Post-aggregation context: maps an aggregate call (or GROUP BY expression) to its register. */
  aggregateRef?(call: CallExpr): ColumnBinding;
  groupRef?(e: Expr): ColumnBinding | undefined;
  /** Result-column context of a query with window functions: maps an `f(...) OVER (...)` call to its register. */
  windowRef?(call: CallExpr): ColumnBinding;
  /**
   * Plan a subquery as a nested plan: the binder produces `subquery` / `inSubquery` plan nodes; `column` is the scalar
   * subquery's first result column.
   */
  planSubquery(select: SelectStmt, mode: 'scalar' | 'exists' | 'in'): { plan: PlanOp; column: { type: StaticType; collation: Collation } };
  /** The statement's catalog (smaltdb ADR 0016 section 7). */
  catalog: Catalog;
}

function literalType(v: SqlValue, isReal: boolean | undefined): StaticType {
  if (v === null) return 'null';
  switch (typeof v) {
    case 'number':
      return isReal || !Number.isSafeInteger(v) ? 'real' : 'int';
    case 'bigint':
      return 'int';
    case 'string':
      return 'text';
    default:
      return 'blob';
  }
}

function isNumericType(t: StaticType): boolean {
  return t === 'int' || t === 'real' || t === 'num';
}

// ------------------------------------------------------------------ binding


/** A copy of `e` carrying the SQL metadata of `c` (the SQL front end: a select-list alias, as the planner compiled it). */
export function withCompiledMeta(e: BoundExpr, c: Pick<SqlMeta, 'collation' | 'collSrc' | 'affinity'>): BoundExpr {
  const copy = { ...e };
  setMeaning(copy, { ...metaOf(e), collation: c.collation, collSrc: c.collSrc, affinity: c.affinity });
  return copy;
}

/** Mark `e` as an SQL form that code generation leaves to the closure compiler (see SqlMeta.opaque). */
function opaque<T extends BoundExpr>(e: T): T {
  setMeaning(e, { ...metaOf(e), opaque: true });
  return e;
}

/** SQL's comparison operators, as the engine's operations (by behaviour name, smaltdb ADR 0016 section 1). */
const COMPARISONS: Readonly<Record<string, string>> = { '=': 'cmp_eq', '!=': 'cmp_ne', '<': 'cmp_lt', '<=': 'cmp_le', '>': 'cmp_gt', '>=': 'cmp_ge', IS: 'cmp_is', 'IS NOT': 'cmp_is_not' };
/** SQL's arithmetic and bitwise operators, as the engine's operations. */
const ARITHMETIC: Readonly<Record<string, string>> = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div_trunc', '%': 'mod_trunc' };
const BITWISE: Readonly<Record<string, string>> = { '&': 'bit_and', '|': 'bit_or', '<<': 'shift_left', '>>': 'shift_right' };

/**
 * `left op right` with SQLite's collation and affinity rules made explicit: a collation attribute and conversion
 * calls, as the engine's `comparisonRule` gives them for the operands' meaning fields.
 */
function bindComparison(op: string, a0: BoundExpr, b0: BoundExpr): BoundExpr {
  const [a, b] = nestedOperands(op, a0, b0) ?? temporalOperands(a0, b0);
  const rule = comparisonRule({ type: typeOf(a), carries: a.carries, affinity: a.affinity }, { type: typeOf(b), carries: b.carries, affinity: b.affinity });
  const wrap = (x: BoundExpr, conv: 'affinity_numeric' | 'affinity_text' | null): BoundExpr => (conv === null ? x : call(conv, [x], typeOf(x)));
  return call(COMPARISONS[op], [wrap(a, rule.left), wrap(b, rule.right)], 'int', rule.collation);
}

// ------------------------------------------------------------------ lists and structs

const isNested = (t: StaticType): boolean => t.startsWith('list<') || t.startsWith('struct<');

/** The list or struct value under its column's JSON text (`cast_text(col)`), if `e` is that. */
function nestedUnder(e: BoundExpr): BoundExpr | undefined {
  return e.k === 'call' && e.fn === 'cast_text' && e.args.length === 1 && isNested(typeOf(e.args[0])) ? e.args[0] : undefined;
}

const EQUALITY = new Set(['=', '!=', 'IS', 'IS NOT']);

/**
 * Two list or struct columns of one type compared for equality: on their values, which are equal exactly when their
 * JSON texts are (smaltdb ADR 0020). An ordering compares the text, as SQL holds it.
 */
function nestedOperands(op: string, a: BoundExpr, b: BoundExpr): [BoundExpr, BoundExpr] | undefined {
  const na = nestedUnder(a);
  const nb = nestedUnder(b);
  return na && nb && typeOf(na) === typeOf(nb) && EQUALITY.has(op) ? [na, nb] : undefined;
}

// ------------------------------------------------------------------ dates and times

const TEMPORAL = new Set<string>(['date', 'datetime', 'time', 'duration']);
const isTemporal = (t: StaticType): boolean => TEMPORAL.has(t);

/** The temporal value under a date or time column's text (`cast_text(col)`), if `e` is that. */
function temporalUnder(e: BoundExpr): BoundExpr | undefined {
  return e.k === 'call' && e.fn === 'cast_text' && e.args.length === 1 && isTemporal(typeOf(e.args[0])) ? e.args[0] : undefined;
}

const daysIn = (y: number, m: number): number => (m === 2 ? (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28) : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]);
const DATE_TEXT = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK_TEXT = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}|\d{6}))?$/;

const validDate = (m: RegExpExecArray | null): boolean => m !== null && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1 && +m[3] <= daysIn(+m[1], +m[2]);
const validClock = (m: RegExpExecArray | null): boolean => {
  if (m === null || +m[1] > 23 || +m[2] > 59 || +m[3] > 59) return false;
  // The result text writes no fraction of 0, three digits for whole ms, else six.
  const f = m[4];
  return f === undefined || (f.length === 3 ? f !== '000' : !f.endsWith('000'));
};

/**
 * Whether `text` is exactly how results write a value of type `t`. Such text compares with the values as their
 * text does (the format is fixed-width and ordered), so the comparison can be on the values themselves.
 */
function isResultText(t: StaticType, text: string): boolean {
  if (t === 'date') return validDate(DATE_TEXT.exec(text));
  if (t === 'time') return validClock(CLOCK_TEXT.exec(text));
  if (t === 'datetime') {
    const sp = text.indexOf(' ');
    return sp === 10 && validDate(DATE_TEXT.exec(text.slice(0, 10))) && validClock(CLOCK_TEXT.exec(text.slice(11)));
  }
  return false;
}

const TEXT_CAST: Readonly<Record<string, string>> = { date: 'cast_date', datetime: 'cast_datetime' };

/**
 * The operands of a comparison on the values of date and time columns where that gives what comparing their text
 * gives (smaltdb ADR 0019, decision 4): two columns of the same type, or a column and a text literal in the result
 * format (converted with `cast_date` / `cast_datetime`). Comparing values keeps indexes and zone maps usable.
 * Anything else compares the text.
 */
function temporalOperands(a: BoundExpr, b: BoundExpr): [BoundExpr, BoundExpr] {
  const ta = temporalUnder(a);
  const tb = temporalUnder(b);
  if (ta && tb) return typeOf(ta) === typeOf(tb) ? [ta, tb] : [a, b];
  const asValue = (col: BoundExpr, other: BoundExpr): BoundExpr | undefined => {
    const t = typeOf(col);
    const fn = TEXT_CAST[t];
    if (!fn || other.k !== 'lit' || typeof other.value !== 'string' || !isResultText(t, other.value)) return undefined;
    return call(fn, [other], t);
  };
  if (ta) {
    const v = asValue(ta, b);
    if (v) return [ta, v];
  }
  if (tb) {
    const v = asValue(tb, a);
    if (v) return [v, tb];
  }
  return [a, b];
}

/**
 * Bind an expression of the parser to a plan expression: resolve its names, type it, and make SQL's rules explicit
 * (comparison collations, affinity conversions, the engine operation for each operator). Subqueries are planned and
 * select-list aliases compiled here, at the moment the closure compiler always did, so planning order, registers
 * and errors are unchanged.
 */
export function bindExpr(e: Expr, scope: CompileScope): BoundExpr {
  if (scope.groupRef) {
    const g = scope.groupRef(e);
    if (g) return withMeaning({ k: 'slot', reg: g.reg, type: g.type }, { collation: g.collation, collSrc: g.collation ? CollSrc.Column : CollSrc.None, affinity: g.affinity });
  }
  switch (e.kind) {
    case 'literal':
      return lit(e.value, literalType(e.value, e.isReal));
    case 'param':
      return param(e.index - 1);
    case 'column': {
      const b = scope.resolveColumn(e, true);
      if (b.bound) return b.bound;
      const slot: BoundExpr = b.use ? { k: 'slot', reg: b.reg, type: b.type, use: b.use } : { k: 'slot', reg: b.reg, type: b.type };
      const meaning = { collation: b.collation, collSrc: CollSrc.Column, affinity: b.affinity };
      // A date or time column (smaltdb ADR 0019) reads as its text, as SQLite would hold it.
      if (isTemporal(b.type)) return withMeaning(call('cast_text', [slot], 'text'), meaning);
      // A list or struct column (smaltdb ADR 0020) reads as its JSON text.
      if (isNested(b.type)) return withMeaning(call('cast_text', [slot], 'text'), meaning);
      return withMeaning(slot, meaning);
    }
    case 'collate': {
      const inner = bindExpr(e.expr, scope);
      const c = collationByName(e.collation);
      if (c === undefined) throw new SmaltError('SMALT_ERROR', `no such collation sequence: ${e.collation}`);
      return withMeaning({ ...inner }, { ...metaOf(inner), collation: c, collSrc: CollSrc.Explicit, opaque: true });
    }
    case 'unary': {
      const x = bindExpr(e.operand, scope);
      switch (e.op) {
        case 'NOT':
          return { k: 'not', type: 'int', arg: x };
        case '-':
          return call('neg', [x], isNumericType(typeOf(x)) ? typeOf(x) : 'num');
        case '~':
          return call('bit_not', [x], 'int');
        case '+':
          // Unary plus is a no-op that strips affinity and collation (SQLite): the same value, without the metadata.
          return opaque(stripped({ ...x }));
        default:
          throw new SmaltError('SMALT_ERROR', `unknown unary operator ${(e as { op: string }).op}`);
      }
    }
    case 'binary':
      if ((e.op === '+' || e.op === '-') && e.right.kind === 'call' && e.right.name === '#interval') {
        // `x ± INTERVAL '…'` (Postgres; smaltdb ADR 0022): the engine's calendar-aware offset_by.
        return bindOffset(bindTemporal(e.left, scope), intervalOffset(e.right, e.op === '-'));
      }
      if (e.op === '+' && e.left.kind === 'call' && e.left.name === '#interval') {
        return bindOffset(bindTemporal(e.right, scope), intervalOffset(e.left, false));
      }
      if (e.op === '=' && e.right.kind === 'call' && e.right.name === 'any' && e.right.args.length === 1 && !e.right.over) {
        // `v = ANY (list)` (Postgres; smaltdb ADR 0022): whether an element of the list equals v.
        const l = listArg(bindExpr(e.right.args[0]!, scope));
        return call('cast_integer', [call('list_contains', [l, bindExpr(e.left, scope)], 'int')], 'int');
      }
      return bindBinary(e.op, bindExpr(e.left, scope), bindExpr(e.right, scope));
    case 'between': {
      const x = bindExpr(e.expr, scope);
      const lo = bindExpr(e.low, scope);
      const hi = bindExpr(e.high, scope);
      const both: BoundExpr = opaque({ k: 'and', type: 'int', args: [bindComparison('>=', x, lo), bindComparison('<=', x, hi)] });
      return e.not ? opaque({ k: 'not', type: 'int', arg: both }) : both;
    }
    case 'isNull':
      return { k: 'isNull', type: 'int', arg: bindExpr(e.expr, scope), not: e.not };
    case 'inList': {
      const x = bindExpr(e.expr, scope);
      const list = e.list.map((v) => bindExpr(v, scope));
      const inList = call('in_list', [x, ...list], 'int');
      return e.not ? opaque({ k: 'not', type: 'int', arg: inList }) : inList;
    }
    case 'inSelect': {
      const probe = bindExpr(e.expr, scope);
      const sub = scope.planSubquery(e.select, 'in');
      const node: BoundExpr = { k: 'inSubquery', probe, plan: sub.plan, collation: 'binary' };
      return e.not ? { k: 'not', type: 'int', arg: node } : node;
    }
    case 'exists': {
      const node: BoundExpr = { k: 'subquery', mode: 'exists', plan: scope.planSubquery(e.select, 'exists').plan, type: 'int', collation: 'binary' };
      return e.not ? { k: 'not', type: 'int', arg: node } : node;
    }
    case 'subquery': {
      const { plan, column } = scope.planSubquery(e.select, 'scalar');
      const node: BoundExpr = { k: 'subquery', mode: 'scalar', plan, type: column.type, collation: collationName(column.collation) };
      // As the compiled scalar subquery: its column's collation, from a column.
      return withMeaning(node, { collation: column.collation, collSrc: column.collation ? CollSrc.Column : CollSrc.None, affinity: 'NONE' });
    }
    case 'like': {
      const x = bindExpr(e.expr, scope);
      const pat = bindExpr(e.pattern, scope);
      const esc = e.escape ? bindExpr(e.escape, scope) : undefined;
      if (e.op === 'REGEXP' && !esc) {
        // `x REGEXP p` (smaltdb ADR 0022): a JavaScript regular expression, as `regexp_like(x, p)`.
        const m = call('cast_integer', [call('regex_match', [x, pat], 'int')], 'int');
        return e.not ? call('cast_integer', [opaque({ k: 'not', type: 'int', arg: m })], 'int') : m;
      }
      if (e.op !== 'LIKE' && e.op !== 'GLOB') throw new SmaltError('SMALT_ERROR', `no such function: ${e.op.toLowerCase()}`);
      const like = call(e.op === 'GLOB' ? 'glob' : 'like', esc ? [x, pat, esc] : [x, pat], 'int');
      return e.not ? opaque({ k: 'not', type: 'int', arg: like }) : like;
    }
    case 'case': {
      const base = e.base ? bindExpr(e.base, scope) : undefined;
      const whens = e.whens.map((w) => {
        const when = bindExpr(w.when, scope);
        return { when: base ? bindComparison('=', base, when) : when, then: bindExpr(w.then, scope) };
      });
      const els = e.else ? bindExpr(e.else, scope) : lit(null, 'null');
      const types = [...whens.map((w) => typeOf(w.then)), typeOf(els)].filter((t) => t !== 'null');
      let type: StaticType = types.length === 0 ? 'null' : types[0];
      for (const t of types) if (t !== type) type = isNumericType(t) && isNumericType(type) ? 'num' : 'any';
      return { k: 'case', whens, else: els, type };
    }
    case 'cast': {
      const x = bindExpr(e.expr, scope);
      const st = storageTypeFor(e.type);
      const affinity = st === 'ANY' ? 'NUMERIC' : affinityOfStorage(st);
      const to = st === 'ANY' || st === 'NUMERIC' ? 'num' : staticTypeOfStorage(st);
      const m = metaOf(x);
      return withMeaning({ k: 'cast', fn: CAST_FUNCTIONS[st] ?? 'cast_numeric', to, arg: x }, { collation: m.collation, collSrc: m.collSrc, affinity });
    }
    case 'call':
      return bindCall(e, scope);
  }
}

/** `e` with no SQL metadata, even where the node it copies had some (a compiled alias keeps its own otherwise). */
function stripped(e: BoundExpr): BoundExpr {
  setMeaning(e, NO_META);
  return e;
}

function bindBinary(op: string, a: BoundExpr, b: BoundExpr): BoundExpr {
  switch (op) {
    case 'AND':
      return { k: 'and', type: 'int', args: [a, b] };
    case 'OR':
      return { k: 'or', type: 'int', args: [a, b] };
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=':
    case 'IS':
    case 'IS NOT':
      return bindComparison(op, a, b);
    case '+':
    case '-':
    case '*':
    case '/':
    case '%': {
      const ta = typeOf(a);
      const tb = typeOf(b);
      return call(ARITHMETIC[op], [a, b], ta === 'real' || tb === 'real' ? 'real' : ta === 'int' && tb === 'int' ? 'int' : 'num');
    }
    case '||':
      return call('text_concat', [a, b], 'text');
    case '&':
    case '|':
    case '<<':
    case '>>':
      return call(BITWISE[op], [a, b], 'int');
    default:
      throw new SmaltError('SMALT_UNSUPPORTED', `operator ${op} is not supported yet`);
  }
}


function bindCall(e: CallExpr, scope: CompileScope): BoundExpr {
  if (e.over !== undefined) {
    if (!scope.windowRef) throw new SmaltError('SMALT_ERROR', `misuse of window function ${e.name}()`);
    const b = scope.windowRef(e);
    return withMeaning({ k: 'slot', reg: b.reg, type: b.type }, { collation: b.collation, collSrc: CollSrc.None, affinity: 'NONE' });
  }
  const name = e.name;
  const isAgg = isAggregateName(name) && !((name === 'min' || name === 'max') && e.args.length > 1);
  if (isAgg) {
    if (!scope.aggregateRef) throw new SmaltError('SMALT_ERROR', `misuse of aggregate function ${name}()`);
    const b = scope.aggregateRef(e);
    return withMeaning(sqlValue({ k: 'slot', reg: b.reg, type: b.type }, undefined), { collation: b.collation, collSrc: CollSrc.None, affinity: 'NONE' });
  }
  if (e.distinct || e.star || e.filter) throw new SmaltError('SMALT_ERROR', `DISTINCT/FILTER/* is only valid with aggregate functions`);
  if (name === 'current_time' || name === 'current_date' || name === 'current_timestamp') {
    // A plain call, so plans carry no closure: the clock is read when the statement runs.
    return call(name, [], 'text');
  }
  const special = bindSpelling(name, e.args, scope);
  if (special) return special;
  const def = scalarFunction(name);
  if (!def) {
    const win = windowFunction(name);
    if (win) {
      // A window-only function without OVER (SQLite checks the argument count first).
      if (!takesArgs(win, e.args.length)) throw new SmaltError('SMALT_ERROR', `wrong number of arguments to function ${name}()`);
      throw new SmaltError('SMALT_ERROR', `misuse of window function ${name}()`);
    }
    throw new SmaltError('SMALT_ERROR', `no such function: ${name}`);
  }
  const n = e.args.length;
  if (!takesArgs(def, n)) throw new SmaltError('SMALT_ERROR', `wrong number of arguments to function ${name}()`);
  if (name === 'likelihood') {
    // SQLite: the probability must be a REAL literal (not an integer, not negated) from 0.0 to 1.0.
    const p = e.args[1];
    if (p.kind !== 'literal' || !p.isReal || typeof p.value !== 'number' || Object.is(p.value, -0) || !(p.value >= 0 && p.value <= 1))
      throw new SmaltError('SMALT_ERROR', 'second argument to likelihood() must be a constant between 0.0 and 1.0');
  }
  // The engine's date and list functions take the values under SQL's text (smaltdb ADR 0022, step 1).
  const engine = engineName(name) ?? name;
  const typed = TYPED_ARGS.has(engine) || engine.startsWith('list_') || engine.startsWith('struct_');
  const args = e.args.map((a, i) => {
    const b = bindExpr(a, scope);
    const under = typed ? (temporalUnder(b) ?? nestedUnder(b) ?? b) : b;
    return i === 0 && TEMPORAL_INPUT.has(engine) ? asTemporal(under) : under;
  });
  // A function's result type follows from its arguments' types (and collations).
  const argTypes = args.map((a) => ({ type: typeOf(a), collation: collationName(metaOf(a).collation) }));
  const fn = engineName(name) ?? name;
  const type = resultType(fn, argTypes);
  // Collation of a function result: from its first argument when that argument carries one.
  const first = args[0] ? metaOf(args[0]) : NO_META;
  const explicit = first.collSrc === CollSrc.Explicit;
  const meaning = { collation: explicit ? first.collation : Collation.Binary, collSrc: explicit ? CollSrc.Explicit : CollSrc.None, affinity: 'NONE' as const };
  return withMeaning(sqlValue(call(fn, args, type), engineFunctions.resultType(fn, argTypes)), meaning);
}

/**
 * A value written into a column stored as a list, struct, date or time: the value under SQL's text of it, so the
 * column takes it as its own type (smaltdb ADR 0022, step 1). Any other column takes `b` as it is.
 */
export function forColumn<E>(e: E, storageType: string): E {
  const b = e as unknown as BoundExpr;
  return STORED_TYPED.has(storageType) ? (((temporalUnder(b) ?? nestedUnder(b) ?? b) as unknown) as E) : e;
}

const STORED_TYPED = new Set(['LIST', 'STRUCT', 'DATE', 'DATETIME', 'TIME', 'DURATION']);

/**
 * SQL spellings that are more than another name (smaltdb ADR 0022): Postgres's `regexp_replace` replaces every match
 * with the `g` flag, and `isnan` compares with NaN, which equals itself in the engine's order.
 */
function bindSpelling(name: string, args: readonly Expr[], scope: CompileScope): BoundExpr | undefined {
  const arity = (min: number, max: number): void => {
    if (args.length < min || args.length > max) throw new SmaltError('SMALT_ERROR', `wrong number of arguments to function ${name}()`);
  };
  const bound = (): BoundExpr[] => args.map((a) => bindExpr(a, scope));
  const plain = { collation: Collation.Binary, collSrc: CollSrc.None, affinity: 'NONE' as const };
  switch (name) {
    case 'regexp_like':
      arity(2, 3);
      return withMeaning(call('cast_integer', [call('regex_match', bound(), 'int')], 'int'), plain);
    case 'regexp_substr':
      arity(2, 3);
      return withMeaning(call('regex_find', bound(), 'text'), plain);
    case 'regexp_replace': {
      arity(3, 4);
      const b = bound();
      const flags = args[3];
      if (flags && flags.kind === 'literal' && typeof flags.value === 'string' && flags.value.includes('g')) {
        const rest = flags.value.replaceAll('g', '');
        return withMeaning(call('regex_replace_all', rest ? [b[0]!, b[1]!, b[2]!, lit(rest, 'text')] : b.slice(0, 3), 'text'), plain);
      }
      return withMeaning(call('regex_replace', b, 'text'), plain);
    }
    case 'list_extract': {
      // From 1, negative from the end, as DuckDB; 0 is NULL. The engine's list_get counts from 0.
      arity(2, 2);
      const [l, i] = [listArg(bindExpr(args[0]!, scope)), bindExpr(args[1]!, scope)];
      const index: BoundExpr = { k: 'case', whens: [{ when: call('cmp_gt', [i, lit(0, 'int')], 'int'), then: call('sub', [i, lit(1, 'int')], 'int') }, { when: call('cmp_lt', [i, lit(0, 'int')], 'int'), then: i }], else: lit(null, 'null'), type: 'int' };
      return withMeaning(sqlValue(call('list_get', [l, index], elementType(typeOf(l))), undefined), plain);
    }
    case 'array_slice': {
      // DuckDB: elements FROM to TO, both from 1 and included. The engine's list_slice takes an offset from 0 and a length.
      arity(3, 3);
      const [l, from, to] = [listArg(bindExpr(args[0]!, scope)), bindExpr(args[1]!, scope), bindExpr(args[2]!, scope)];
      const offset = call('sub', [from, lit(1, 'int')], 'int');
      const length = call('add', [call('sub', [to, from], 'int'), lit(1, 'int')], 'int');
      return withMeaning(sqlValue(call('list_slice', [l, offset, length], typeOf(l)), undefined), plain);
    }
    case '#interval':
      throw new SmaltError('SMALT_ERROR', 'an INTERVAL can only be added to or subtracted from a date or time');
    case 'now':
      arity(0, 0);
      return withMeaning(call('current_timestamp', [], 'text'), plain);
    case 'date_part': {
      // `date_part('field', x)` and `EXTRACT(field FROM x)` (Postgres): the part as an integer.
      arity(2, 2);
      const f = args[0]!;
      const fn = f.kind === 'literal' && typeof f.value === 'string' ? DATE_PARTS[f.value.toLowerCase()] : undefined;
      if (!fn) throw new SmaltError('SMALT_ERROR', `date_part: unknown field${f.kind === 'literal' ? ` ${String(f.value)}` : ''} (${Object.keys(DATE_PARTS).join(', ')})`);
      return withMeaning(call(fn, [asTemporal(bindTemporal(args[1]!, scope))], 'int'), plain);
    }
    case 'date_trunc': {
      // `date_trunc('unit', x)` (Postgres): the engine's trunc_temporal(x, unit).
      arity(2, 2);
      const x = asTemporal(bindTemporal(args[1]!, scope));
      return withMeaning(sqlValue(call('trunc_temporal', [x, bindExpr(args[0]!, scope)], typeOf(x)), undefined), plain);
    }
    case 'isnan': {
      arity(1, 1);
      return withMeaning(call('cast_integer', [call('cmp_eq', [bindExpr(args[0]!, scope), lit(Number.NaN, 'real')], 'int')], 'int'), plain);
    }
    default:
      return undefined;
  }
}

/** A list argument: the value under SQL's text of it. */
function listArg(b: BoundExpr): BoundExpr {
  const l = nestedUnder(b) ?? b;
  if (!typeOf(l).startsWith('list<')) throw new SmaltError('SMALT_MISMATCH', 'expected a list');
  return l;
}

/** The element type of `list<T>`. */
const elementType = (t: StaticType): StaticType => t.slice(5, -1) as StaticType;

/** `x` moved by `offset` (engine offset text such as `1mo2d`), as SQL holds the result. */
function bindOffset(x: BoundExpr, offset: BoundExpr): BoundExpr {
  const t = asTemporal(x);
  return withMeaning(sqlValue(call('offset_by', [t, offset], typeOf(t)), undefined), { collation: Collation.Binary, collSrc: CollSrc.None, affinity: 'NONE' });
}

const INTERVAL_UNITS: Readonly<Record<string, string>> = {
  year: 'y', years: 'y', quarter: 'q', quarters: 'q', month: 'mo', months: 'mo', mon: 'mo', mons: 'mo', week: 'w', weeks: 'w',
  day: 'd', days: 'd', hour: 'h', hours: 'h', minute: 'm', minutes: 'm', min: 'm', mins: 'm', second: 's', seconds: 's',
  sec: 's', secs: 's', millisecond: 'ms', milliseconds: 'ms', microsecond: 'us', microseconds: 'us',
};

/** `INTERVAL '1 month 2 days'` as the engine's offset text (`1mo2d`), negated for subtraction. */
function intervalOffset(e: CallExpr, negate: boolean): BoundExpr {
  const a = e.args[0];
  const text = a && a.kind === 'literal' ? String(a.value) : '';
  const parts = [...text.matchAll(/([+-]?\d+)\s*([a-z]+)/gi)];
  const rest = text.replace(/([+-]?\d+)\s*([a-z]+)/gi, '').trim();
  if (parts.length === 0 || rest !== '') throw new SmaltError('SMALT_ERROR', `invalid INTERVAL: '${text}' (for example '1 month 2 days')`);
  const out = parts.map(([, n, unit]) => {
    const u = INTERVAL_UNITS[unit!.toLowerCase()];
    if (!u) throw new SmaltError('SMALT_ERROR', `invalid INTERVAL unit: ${unit}`);
    const v = negate ? -Number(n) : Number(n);
    return `${v}${u}`;
  });
  return lit(out.join(''), 'text');
}

/** The fields of `EXTRACT` and `date_part`, and the engine function each reads. */
const DATE_PARTS: Readonly<Record<string, string>> = {
  year: 'year', month: 'month', day: 'day', hour: 'hour', minute: 'minute', second: 'second', microsecond: 'microsecond',
  microseconds: 'microsecond', isodow: 'weekday', doy: 'day_of_year',
};

/** Engine functions whose first argument is a date or time: SQL's text is read as one first (ADR 0022, rule 5). */
const TEMPORAL_INPUT = new Set([
  'year', 'month', 'day', 'weekday', 'day_of_year', 'hour', 'minute', 'second', 'microsecond',
  'format_temporal', 'trunc_temporal', 'offset_by', 'to_zone', 'from_zone', 'zone_offset',
]);

/** A date or time as the engine holds it: a temporal value as it is, anything else read from its text. */
function asTemporal(b: BoundExpr): BoundExpr {
  const t = typeOf(b);
  if (isTemporal(t)) return b;
  return call('parse_datetime', [t === 'text' ? b : call('cast_text', [b], 'text')], 'datetime');
}

/** `e` bound, with a date or time column's value under its text. */
const bindTemporal = (e: Expr, scope: CompileScope): BoundExpr => {
  const b = bindExpr(e, scope);
  return temporalUnder(b) ?? b;
};

/** Functions whose arguments are the engine's dates and times, not SQL's text of them. */
const TYPED_ARGS = new Set([
  'year', 'month', 'day', 'weekday', 'day_of_year', 'hour', 'minute', 'second', 'microsecond',
  'format_temporal', 'trunc_temporal', 'offset_by', 'to_zone', 'from_zone', 'zone_offset', 'cast_date', 'cast_datetime',
]);

/**
 * A value as SQL holds it (smaltdb ADRs 0018–0020): a date, time, list or struct as its text, as columns read; a truth
 * value as 0 / 1.
 */
function sqlValue(b: BoundExpr, engineType: StaticType | undefined): BoundExpr {
  const t = typeOf(b);
  if (isTemporal(t) || isNested(t)) return call('cast_text', [b], 'text');
  if (engineType === 'bool') return call('cast_integer', [b], 'int');
  return b;
}

const CAST_FUNCTIONS: Record<string, string> = { INTEGER: 'cast_integer', REAL: 'cast_real', TEXT: 'cast_text', BLOB: 'cast_blob' };

/** Split a predicate into AND-ed conjuncts. */
export function conjuncts(e: Expr | undefined, out: Expr[] = []): Expr[] {
  if (!e) return out;
  if (e.kind === 'binary' && e.op === 'AND') {
    conjuncts(e.left, out);
    conjuncts(e.right, out);
  } else out.push(e);
  return out;
}
