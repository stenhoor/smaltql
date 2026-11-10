// smaltql's own theme rules: the playgrounds' SQL runner (the site kit's playground.ts runs it). Not a kit file.
import { sqlRunner, type SqlDatabase } from './playground'

/** One in-memory database for the visit, in a worker that reads SQL with this checkout's smaltql. */
export const sql = sqlRunner(async () => {
  const { open } = await import('smaltdb')
  const db = await open('playground', {
    storage: 'memory',
    multiTab: false,
    worker: () => new Worker(new URL('./play-worker.ts', import.meta.url), { type: 'module', name: 'smaltql playground' }),
  })
  return db as unknown as SqlDatabase
})
