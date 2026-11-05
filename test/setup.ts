// Every test runs smaltql's SQL. smaltdb's engine entry still registers the SQL it carries (until it no longer does,
// ADR 0015 step 9): register smaltql's after the test's imports, so smaltql's is the one databases read.
import { beforeAll } from 'vitest';
import { registerLanguage } from 'smaltdb/language';
import { sqlLanguage } from '../src/language.js';

beforeAll(() => registerLanguage(sqlLanguage));
