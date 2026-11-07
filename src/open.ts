/**
 * `open()` for SQL (smaltdb ADR 0015): smaltdb's client `open()`, with smaltql's worker (`@smaltworks/smaltql/worker`) as its
 * engine worker. `options.worker` still overrides it, for a worker entry that also installs plugins.
 */
import { open as openDatabase, type Database, type OpenOptions } from 'smaltdb';

export function open(name: string, options: OpenOptions = {}): Promise<Database> {
  return openDatabase(name, { worker: () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module', name: 'smaltql' }), ...options });
}
