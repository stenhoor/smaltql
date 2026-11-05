/**
 * smaltql: SQL for the smaltdb engine (ADR 0015). The language parses SQL and binds it to plans; it reaches the engine
 * only through `smaltdb/language`.
 *
 * - In a page: `open()` opens a database whose engine worker (`smaltql/worker`) reads SQL.
 * - In a worker entry with plugins: `defineWorker({ languages: [sqlLanguage], plugins })` from `smaltdb/worker-runtime`.
 * - With the engine in the same thread: `import 'smaltql/register'`, or pass `sqlLanguage` to `registerLanguage`.
 */
export { sqlLanguage } from './language.js';
export { open } from './open.js';
export type { Database, OpenOptions } from 'smaltdb';
export { parse, parseOne, parseExpr, SqlSyntaxError } from './parser.js';
export type * from './ast.js';
