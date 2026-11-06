/**
 * Tables as smaltdb's catalog describes them (smaltdb ADR 0016 section 7: `BindContext.table`, `writeTable`,
 * `indexTable`): the lookups the binder makes of them.
 */
import { type CatalogTable, Collation, type CollationName } from 'smaltdb/language';

export type { CatalogTable };

/** The position of column `name` (case-insensitive), or -1. */
export function findColumn(table: CatalogTable, name: string): number {
  const lower = name.toLowerCase();
  for (let i = 0; i < table.columns.length; i++) if (table.columns[i].name.toLowerCase() === lower) return i;
  return -1;
}

/** The position of the column that is the table's rowid (its INTEGER PRIMARY KEY), or -1. */
export function rowidColumn(table: CatalogTable): number {
  return table.columns.findIndex((c) => c.rowid);
}

const COLLATIONS: Readonly<Record<CollationName, Collation>> = { binary: Collation.Binary, nocase: Collation.NoCase, rtrim: Collation.RTrim };

/** A collation name as the engine's collation. */
export const collationOf = (name: CollationName): Collation => COLLATIONS[name];
