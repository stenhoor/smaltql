// Every test runs smaltql's SQL. smaltdb's engine carries no language (ADR 0015), so register smaltql's before the tests,
// as `@smaltworks/smaltql/register` and the worker entry do in an application.
import { beforeAll } from 'vitest';
import { registerLanguage } from 'smaltdb/language';
import { sqlLanguage } from '../src/language.js';

beforeAll(() => registerLanguage(sqlLanguage));
