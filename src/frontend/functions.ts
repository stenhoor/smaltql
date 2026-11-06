/**
 * The engine's functions and expression metadata, read through its catalog (smaltdb ADR 0016 section 7): function
 * metadata from `engineFunctions` (the same for every database), and what the engine computes for a bound expression
 * from the statement's `BindContext.catalog`.
 */
import { type Affinity, type BoundExpr, type Catalog, type CatalogFunction, CollSrc, Collation, type StaticType, engineFunctions } from 'smaltdb/language';

/** True when `name` is an aggregate function (`min` and `max` of one argument; of several they are scalars). */
export const isAggregateName = (name: string): boolean => engineFunctions.function(name, 'aggregate') !== undefined;

/** A named scalar function SQL can call (the engine's operations are reached through SQL's operators instead). */
export function scalarFunction(name: string): CatalogFunction | undefined {
  const f = engineFunctions.function(name, 'scalar');
  return f && !f.operation ? f : undefined;
}

export const aggregateFunction = (name: string): CatalogFunction | undefined => engineFunctions.function(name, 'aggregate');

/** A window-only function (ranking and navigation). */
export const windowFunction = (name: string): CatalogFunction | undefined => engineFunctions.function(name, 'window');

/** True when `n` arguments fit `f`. */
export const takesArgs = (f: CatalogFunction, n: number): boolean => n >= f.minArgs && (f.maxArgs === null || n <= f.maxArgs);

/** Function `name`'s result type for these argument types. */
export const resultType = (name: string, args: readonly (StaticType | { type: StaticType; collation?: 'binary' | 'nocase' | 'rtrim' })[]): StaticType => engineFunctions.resultType(name, args) ?? 'any';

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
