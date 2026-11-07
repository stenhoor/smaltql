/**
 * Registers the SQL language with the engine: `import '@smaltworks/smaltql/register'` makes every database in that engine read SQL
 * (smaltdb's `registerLanguage`, ADR 0015).
 */
import { registerLanguage } from 'smaltdb/language';
import { sqlLanguage } from './language.js';

registerLanguage(sqlLanguage);
