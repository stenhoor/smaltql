/**
 * smaltql's worker entry and open(): the worker registers SQL through smaltdb's defineWorker, and open() starts that
 * worker unless the caller gives another. Node has no Worker, so smaltdb's side is stubbed here; smaltdb's browser
 * tests run SQL from smaltql in a real worker.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sqlLanguage } from '../src/language.js';

const defineWorker = vi.fn();
const openDatabase = vi.fn(async (_name: string, options: { worker?: unknown }) => ({ options }));
vi.mock('smaltdb/worker-runtime', () => ({ defineWorker }));
vi.mock('smaltdb', () => ({ open: openDatabase }));

class FakeWorker {
  constructor(readonly url: URL, readonly options: WorkerOptions) {}
}

afterEach(() => vi.unstubAllGlobals());

describe('smaltql/worker and open()', () => {
  it('the worker entry registers SQL with defineWorker', async () => {
    await import('../src/worker.js');
    expect(defineWorker).toHaveBeenCalledWith({ languages: [sqlLanguage] });
  });

  it('open() starts smaltql/worker, unless options give another worker', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { open } = await import('../src/index.js');
    await open('db', { cacheSizeBytes: 1 } as never);
    const [name, options] = openDatabase.mock.calls[0] as [string, { worker: () => FakeWorker; cacheSizeBytes: number }];
    expect(name).toBe('db');
    expect(options.cacheSizeBytes).toBe(1);
    const worker = options.worker();
    expect(worker.url.pathname.endsWith('/worker.js')).toBe(true);
    expect(worker.options).toEqual({ type: 'module', name: 'smaltql' });
    const mine = (): never => undefined as never;
    await open('db', { worker: mine });
    expect((openDatabase.mock.calls[1][1] as { worker: unknown }).worker).toBe(mine);
  });
});
