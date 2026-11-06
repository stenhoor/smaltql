/**
 * SQL's wording of the engine's errors (smaltdb ADR 0016 section 10): the engine gives an error's code and fields, and
 * the SQL front end words it as SQLite does. Errors it has no wording for keep the engine's message.
 */
import type { ErrorToWord } from 'smaltdb/language';

/** The message SQLite gives for `e`, or undefined to keep the engine's. */
export function sqlErrorMessage(e: ErrorToWord): string | undefined {
  const table = e.table;
  const columns = e.columns ?? [];
  switch (e.constraint) {
    case 'notNull':
      return table && columns.length === 1 ? `NOT NULL constraint failed: ${table}.${columns[0]}` : undefined;
    case 'unique':
    case 'primaryKey':
      // SQLite says UNIQUE for primary keys too, and names an index on expressions by its name.
      if (!table) return undefined;
      if (columns.length > 0) return `UNIQUE constraint failed: ${columns.map((c) => `${table}.${c}`).join(', ')}`;
      return e.name !== undefined ? `UNIQUE constraint failed: index '${e.name}'` : undefined;
    case 'check':
      return e.name !== undefined ? `CHECK constraint failed: ${e.name}` : undefined;
    case 'foreignKey':
      return 'FOREIGN KEY constraint failed';
    default:
      // A value of the wrong type (`datatype`) and everything else: the engine's words, which name the value's type.
      return undefined;
  }
}
