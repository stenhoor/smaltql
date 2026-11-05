/**
 * smaltql's engine worker (`smaltql/worker`): smaltdb's engine with SQL registered. `open()` starts it. An application
 * that also uses plugins writes its own worker entry the same way (smaltdb's `defineWorker`):
 *
 *     import { defineWorker } from 'smaltdb/worker-runtime';
 *     import { sqlLanguage } from 'smaltql';
 *     import parquet from '@smaltdb/parquet';
 *     defineWorker({ languages: [sqlLanguage], plugins: [parquet] });
 */
import { defineWorker } from 'smaltdb/worker-runtime';
import { sqlLanguage } from './language.js';

defineWorker({ languages: [sqlLanguage] });
