/**
 * What SQL means beyond an expression's type, written into the plan as its meaning fields (smaltdb ADR 0016
 * section 2): the collation an operand carries and where it came from (`carries`), its affinity (`affinity`), and
 * forms code generation leaves to the general evaluator (`inline: false`); on an operation, `decorrelate: false`. The
 * binder reasons in `SqlMeta` terms (a collation, its source, an affinity) and reads them back with `metaOf`.
 */
import { type BoundExpr, CollSrc, type PlanOp, type SqlMeta } from 'smaltdb/language';

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
