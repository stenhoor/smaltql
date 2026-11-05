/**
 * smaltql: SQL for the smaltdb engine (ADR 0015). The language parses SQL and binds it to plans; it reaches the engine
 * only through `smaltdb/language`. Register it with `import 'smaltql/register'`, or pass `sqlLanguage` to smaltdb's
 * `registerLanguage`.
 */
export { sqlLanguage } from './language.js';
export { parse, parseOne, parseExpr, SqlSyntaxError } from './parser.js';
export type * from './ast.js';
