// The playgrounds' engine worker: smaltdb's engine with smaltql's SQL from this checkout's source, so a playground runs
// the same SQL the examples test checks. Started on a page's first Run (smaltql.ts).
import { defineWorker } from 'smaltdb/worker-runtime'
import { sqlLanguage } from '../../../src/language'

defineWorker({ languages: [sqlLanguage] })
