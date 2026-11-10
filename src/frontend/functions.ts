/**
 * The engine's functions and expression metadata, read through its catalog (smaltdb ADR 0016 section 7): function
 * metadata from `engineFunctions` (the same for every database), and what the engine computes for a bound expression
 * from the statement's `BindContext.catalog`.
 */
import { type Affinity, type BoundExpr, type Catalog, type CatalogFunction, Collation, type StaticType, engineFunctions } from 'smaltdb/language';
import { CollSrc } from './meaning.js';

/**
 * The engine functions SQL calls by name (smaltdb ADR 0022, decision 2): SQLite's, and the smaltdb extensions. Any
 * other engine function, including one the engine adds later, is `no such function` in SQL until smaltql spells it.
 */
const SQL_FUNCTIONS = new Set([
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'avg', 'ceil',
  'ceiling', 'changes', 'char', 'coalesce', 'concat', 'concat_ws', 'corr', 'cos', 'cosh', 'count', 'covar_pop',
  'covar_samp', 'date', 'datetime', 'day', 'day_of_year', 'degrees', 'exp', 'first', 'floor', 'format',
  'from_zone', 'group_concat', 'hex', 'hour', 'if', 'ifnull', 'iif', 'implode', 'instr',
  'julianday', 'kurtosis', 'kurtosis_pop', 'last', 'last_insert_rowid', 'length', 'likelihood', 'likely',
  'list_max', 'list_mean', 'list_min',
  'list_sum', 'ln', 'log', 'log10', 'log2', 'lower',
  'lower_unicode', 'ltrim', 'make_date', 'make_datetime', 'max', 'median', 'microsecond', 'min', 'minute', 'mod',
  'month', 'nullif', 'octet_length', 'offset_by', 'percentile', 'percentile_cont',
  'percentile_disc', 'pi', 'pow', 'power', 'printf', 'quote', 'radians', 'random', 'randomblob', 'regex_find',
  'regex_match', 'regex_replace', 'regex_replace_all', 'replace', 'round', 'rtrim', 'second', 'sign', 'sin', 'sinh',
  'skewness', 'skewness_pop', 'smaltdb_version', 'sqrt', 'stddev', 'stddev_pop', 'stddev_samp', 'strftime',
  'string_agg', 'substr', 'substring', 'sum', 'tan', 'tanh', 'time', 'timediff', 'to_zone', 'total',
  'total_changes', 'trim', 'trunc', 'typeof', 'unicode', 'unixepoch', 'unlikely', 'upper',
  'upper_unicode', 'var_pop', 'var_samp', 'variance', 'weekday', 'year', 'zeroblob', 'zone_offset'
]);

/** SQL's names for engine functions it spells differently. */
const SQL_SPELLINGS: Readonly<Record<string, string>> = {
  round_even: 'round_half_even',
  // Dates and times (step 3).
  make_timestamp: 'make_datetime',
  // What the parser gives typed literals and ARRAY[…]: names SQL text can't spell.
  '#date': 'cast_date',
  '#timestamp': 'cast_datetime',
  '#time': 'cast_time',
  '#array': 'list_of',
  strptime: 'parse_datetime',
  // Lists (smaltdb ADR 0022, step 5): Postgres's and DuckDB's names.
  cardinality: 'list_len',
  array_length: 'list_len',
  array_contains: 'list_contains',
  array_cat: 'list_concat',
  array_to_string: 'list_join',
  array_sort: 'list_sort',
  array_distinct: 'list_unique',
  array_reverse: 'list_reverse',
};

/** The engine function a SQL function name calls, or undefined if SQL has no such function. */
export const engineName = (name: string): string | undefined => SQL_SPELLINGS[name] ?? (SQL_FUNCTIONS.has(name) ? name : undefined);

/** True when `name` is an aggregate function (`min` and `max` of one argument; of several they are scalars). */
export const isAggregateName = (name: string): boolean => engineName(name) !== undefined && engineFunctions.function(name, 'aggregate') !== undefined;

/** A named scalar function SQL can call (the engine's operations are reached through SQL's operators instead). */
export function scalarFunction(name: string): CatalogFunction | undefined {
  const engine = engineName(name);
  const f = engine === undefined ? undefined : engineFunctions.function(engine, 'scalar');
  return f && !f.operation ? f : undefined;
}

export const aggregateFunction = (name: string): CatalogFunction | undefined => (isAggregateName(name) ? engineFunctions.function(name, 'aggregate') : undefined);

/** A window-only function (ranking and navigation). */
export const windowFunction = (name: string): CatalogFunction | undefined => engineFunctions.function(name, 'window');

/** True when `n` arguments fit `f`. */
export const takesArgs = (f: CatalogFunction, n: number): boolean => n >= f.minArgs && (f.maxArgs === null || n <= f.maxArgs);

/** Function `name`'s result type for these argument types. */
/** A function's result type as SQL gives it: a `bool` is 0 / 1 in SQL, an INTEGER (smaltdb ADR 0018). */
export const resultType = (name: string, args: readonly (StaticType | { type: StaticType; collation?: 'binary' | 'nocase' | 'rtrim' })[]): StaticType => {
  const t = engineFunctions.resultType(name, args) ?? 'any';
  return t === 'bool' ? 'int' : t;
};

const COLLATIONS: Readonly<Record<string, Collation>> = { binary: Collation.Binary, nocase: Collation.NoCase, rtrim: Collation.RTrim };

/** What the engine computes for `b`: its type, and the collation (with its source) and affinity a comparison reads. */
export function metadata(b: BoundExpr, catalog: Catalog): { type: StaticType; collation: Collation; collSrc: CollSrc; affinity: Affinity } {
  const d = catalog.describe(b);
  return {
    type: d.type,
    collation: d.carries ? COLLATIONS[d.carries.collation] : Collation.Binary,
    collSrc: d.carries ? (d.carries.from === 'explicit' ? CollSrc.Explicit : CollSrc.Column) : CollSrc.None,
    affinity: d.affinity ?? 'NONE',
  };
}
