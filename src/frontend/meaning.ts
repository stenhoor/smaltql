/**
 * What SQL means beyond an expression's type, written into the plan as its meaning fields (smaltdb ADR 0016
 * section 2): the collation an operand carries and where it came from (`carries`), its affinity (`affinity`), and
 * forms code generation leaves to the general evaluator (`inline: false`); on an operation, `decorrelate: false`. The
 * binder reasons in `SqlMeta` terms (a collation, its source, an affinity) and reads them back with `metaOf`.
 */
import { type Affinity, type BoundExpr, Collation, type CollationName, type PlanOp } from 'smaltdb/language';

/** Where an operand's collation came from: none, a column's, or an explicit COLLATE. */
export const CollSrc = { None: 0, Column: 1, Explicit: 2 } as const;
export type CollSrc = (typeof CollSrc)[keyof typeof CollSrc];

/** What SQL knows of an expression besides its type, as the binder reasons about it. */
export interface SqlMeta {
  collation: Collation;
  collSrc: CollSrc;
  affinity: Affinity;
  /** An SQL form code generation leaves whole to the general evaluator (`inline: false`). */
  opaque?: true;
}

export const NO_META: SqlMeta = Object.freeze({ collation: Collation.Binary, collSrc: CollSrc.None, affinity: 'NONE' });

const COLLATION_OF: Readonly<Record<string, Collation>> = { binary: Collation.Binary, nocase: Collation.NoCase, rtrim: Collation.RTrim };
const AFFINITY_OF: Readonly<Record<string, number>> = { NONE: 0, INTEGER: 1, REAL: 2, NUMERIC: 3, TEXT: 4, BLOB: 5 };
const AFFINITIES: readonly Affinity[] = ['NONE', 'INTEGER', 'REAL', 'NUMERIC', 'TEXT', 'BLOB'];

/** Every `SqlMeta`, interned and frozen: `metaOf` is read often while binding, and allocates nothing. */
const METAS: SqlMeta[] = [];
for (let i = 0; i < 3 * 3 * 6 * 2; i++) {
  const opaque = i % 2 === 1;
  METAS.push(
    Object.freeze({
      collation: Math.floor(i / 36) as Collation,
      collSrc: (Math.floor(i / 12) % 3) as CollSrc,
      affinity: AFFINITIES[Math.floor(i / 2) % 6],
      ...(opaque ? { opaque: true as const } : {}),
    }),
  );
}

const COLLATION_NAMES: readonly CollationName[] = ['binary', 'nocase', 'rtrim'];

/** An engine collation's name, as plans write it. */
export const collationName = (c: Collation): CollationName => COLLATION_NAMES[c];

/** `e`'s meaning fields as the binder reasons about them. */
export function metaOf(e: BoundExpr): SqlMeta {
  const c = e.carries;
  if (c === undefined && e.affinity === undefined && e.inline !== false) return NO_META;
  const collation = c ? COLLATION_OF[c.collation] : 0;
  const collSrc = c ? (c.from === 'explicit' ? 2 : 1) : 0;
  return METAS[((collation * 3 + collSrc) * 6 + (e.affinity === undefined ? 0 : AFFINITY_OF[e.affinity])) * 2 + (e.inline === false ? 1 : 0)];
}

type Meaning = { -readonly [K in 'carries' | 'affinity' | 'inline']?: BoundExpr[K] };

/** The `carries` values, shared and frozen: `[collation][explicit ? 1 : 0]`. */
const CARRIES = (['binary', 'nocase', 'rtrim'] as const).map((collation) => [
  Object.freeze({ collation, from: 'column' as const }),
  Object.freeze({ collation, from: 'explicit' as const }),
]);

/** Writes `m` as `e`'s meaning fields, replacing any it had. */
export function setMeaning(e: BoundExpr, m: SqlMeta): void {
  const x = e as Meaning;
  // `delete` only what is there: deleting puts an object in V8's slow dictionary mode.
  if (m.collSrc !== CollSrc.None) x.carries = CARRIES[m.collation][m.collSrc === CollSrc.Explicit ? 1 : 0];
  else if (x.carries !== undefined) delete x.carries;
  if (m.affinity !== 'NONE') x.affinity = m.affinity as BoundExpr['affinity'];
  else if (x.affinity !== undefined) delete x.affinity;
  if (m.opaque) x.inline = false;
  else if (x.inline !== undefined) delete x.inline;
}

/** `e` with the meaning `m` (a node built just now: nothing is written when `m` says nothing). */
export function withMeaning<T extends BoundExpr>(e: T, m: SqlMeta): T {
  if (m.collSrc !== CollSrc.None || m.affinity !== 'NONE' || m.opaque) setMeaning(e, m);
  return e;
}

/** Copies `from`'s meaning fields to `to`, a node built just now. */
export function copyMeaning(from: BoundExpr, to: BoundExpr): void {
  const x = to as Meaning;
  if (from.carries !== undefined) x.carries = from.carries;
  if (from.affinity !== undefined) x.affinity = from.affinity;
  if (from.inline === false) x.inline = false;
}

/** Marks a plan whose views or FROM subqueries the binder merged into it: decorrelation does not apply to it. */
export function noDecorrelate(plan: PlanOp): void {
  (plan as { decorrelate?: false }).decorrelate = false;
}
