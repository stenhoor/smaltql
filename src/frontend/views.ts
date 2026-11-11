/**
 * Views as the SQL front end reads them: the engine keeps a view as its source (plan/bind-context.ts `getView`), and
 * SQL parses that source where it reads the view, once per text.
 */
import { SmaltError } from 'smaltdb/language';
import type { Source, ViewInterfaceColumn } from 'smaltdb/language';
import type { CreateViewStmt, SelectStmt } from '../ast.js';
import { parseOne } from '../parser.js';

/**
 * A view the front end flattens or plans: its name, text, column names and parsed query, and its interface (smaltdb ADR
 * 0027). `reshaped`: its query no longer gives exactly its interface, so it is read as the interface says (never
 * flattened).
 */
export interface SqlView {
  name: string;
  sql: string;
  columns?: string[];
  select: SelectStmt;
  interface?: readonly ViewInterfaceColumn[];
  reshaped?: true;
}

const parsed = new Map<string, SelectStmt>();
const MAX_CACHED = 1024;

/** The query of a view written in SQL (its CREATE VIEW or CREATE MATERIALIZED VIEW text), parsed once per text. */
export function viewSelect(source: Source): SelectStmt {
  if (source.language !== 'sql') throw new SmaltError('SMALT_MISUSE', `view is written in ${source.language}, which SQL cannot read`);
  let s = parsed.get(source.text);
  if (s === undefined) {
    s = (parseOne(source.text).stmt as CreateViewStmt).select;
    if (parsed.size >= MAX_CACHED) parsed.delete(parsed.keys().next().value!);
    parsed.set(source.text, s);
  }
  return s;
}

/** A view from the catalog, as SQL reads it. */
export function sqlView(v: { name: string; source: Source; columns?: readonly string[]; interface?: readonly ViewInterfaceColumn[]; reshaped?: true } | undefined): SqlView | undefined {
  return (
    v && {
      name: v.name,
      sql: v.source.text,
      ...(v.columns ? { columns: [...v.columns] } : {}),
      select: viewSelect(v.source),
      ...(v.interface ? { interface: v.interface } : {}),
      ...(v.reshaped ? { reshaped: true as const } : {}),
    }
  );
}
