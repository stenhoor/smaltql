# Getting started

smaltql is SQL for [smaltdb](https://smaltdb.dev), an embedded database for web pages. The engine runs in a Web Worker and stores data in the Origin Private File System (OPFS); smaltql gives it a SQL dialect based on SQLite. Your page talks to it through a small promise-based client.

## Install

```sh
npm install smaltql smaltdb
```

smaltql declares smaltdb as a peer dependency, so an application has one engine. The entry points:

| Import | Use it for |
|---|---|
| `smaltql` | `open()` a SQL database from a page or a worker (the engine runs in its own worker); `sqlLanguage` and the SQL parser. |
| `smaltql/worker` | The engine worker `open()` starts: smaltdb's engine with SQL registered. |
| `smaltql/register` | Registers SQL with the engine in the current thread: for `smaltdb/engine` in Node, tests and tools. |
| `smaltdb` | The client's types and errors (`Database`, `SmaltdbError`), and `queryPlan` for [plans](https://smaltdb.dev/reference/engine/). |
| `smaltdb/engine` | The engine itself, synchronous and in-process. See [the engine API](https://smaltdb.dev/reference/api/engine). |
| `smaltdb/worker-runtime` | `defineWorker()`, to write your own engine worker entry with [plugins](./plugins). |

Neither package has runtime dependencies. Optional features are separate [plugin](./plugins) packages: `@smaltdb/io` (CSV and JSON formats, import and export), `@smaltdb/external` (files, URLs, S3 and Azure as data sources) and `@smaltdb/parquet` (Parquet).

Type declarations ship with the packages. The engine needs Node 20 or later when you run it in Node.

## A first query

```ts
import { open } from 'smaltql';

const db = await open('app'); // a database named "app", stored in OPFS
await db.exec('CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, body TEXT NOT NULL)');
await db.exec('INSERT INTO notes(body) VALUES (?)', ['Hello, smaltql']);

const rows = await db.query('SELECT id, body FROM notes');
console.log(rows); // [{ id: 1, body: 'Hello, smaltql' }]

await db.close();
```

`open()` starts the engine worker and opens (or creates) the database. Every call returns a promise, so the main thread never waits on the database. The same SQL runs in the engine directly:

```sql
CREATE TABLE notes(id INTEGER PRIMARY KEY, body TEXT NOT NULL);
INSERT INTO notes(body) VALUES ('Hello, smaltql');
SELECT id, body FROM notes;
```

| id | body |
|---|---|
| 1 | Hello, smaltql |

Next: the [quick start](./quick-start) builds a small data layer step by step.

## Loading the engine worker

`open()` starts the engine with this line, in smaltql's `dist/index.js`:

```js
new Worker(new URL('./worker.js', import.meta.url), { type: 'module', name: 'smaltql' });
```

`dist/worker.js` imports the engine (`smaltdb/worker-runtime`), so a bundler builds the worker:

- **Vite.** Works without configuration. Vite recognises the `new Worker(new URL(…, import.meta.url))` pattern and builds the worker with its imports, in the dev server and in production builds. A production build may warn that `node:fs/promises` "has been externalized for browser compatibility": that import is only used when the engine runs in Node, and the warning can be ignored.
- **Other bundlers.** A bundler that understands the same pattern builds the worker the same way. If yours does not, write your own worker entry (below) and build it as a separate entry point.
- **No bundler.** Not supported yet: the worker needs its imports resolved. Prebuilt files for pages without a build step are planned.

The `worker` option overrides where the engine worker comes from. Your own worker entry is how you add [plugins](./plugins):

```ts
// db-worker.ts
import { defineWorker } from 'smaltdb/worker-runtime';
import { sqlLanguage } from 'smaltql';
import io from '@smaltdb/io';

defineWorker({ languages: [sqlLanguage], plugins: [io] });
```

```ts
import { open } from 'smaltql';

const db = await open('app', { worker: () => new Worker(new URL('./db-worker.ts', import.meta.url), { type: 'module' }) });
```

The option also takes a URL or string (the client starts `new Worker(url, { type: 'module' })`) or a `Worker` you created yourself. Prefer a function or a URL: with [multi-tab access](./databases#multi-tab-access), a tab that takes over the database later starts its engine worker from the option, and a `Worker` object can only be used once.

## Browser requirements

What each feature needs from the browser, from the client and worker code:

| Feature | Needs | Without it |
|---|---|---|
| The engine | Module workers (`new Worker(url, { type: 'module' })`) | The database does not run. |
| Persistent storage (`storage: 'opfs'`, the default) | OPFS with `FileSystemSyncAccessHandle` in dedicated workers | `open()` fails with `SMALT_CANTOPEN`. Use `storage: 'memory'`, which needs no OPFS. |
| Sharing one database between tabs | Web Locks (`navigator.locks`) and `BroadcastChannel` | Each `open()` owns the file alone; a second tab that opens it fails with `SMALT_BUSY`. |
| Stopping a statement that is already running (`signal`) | A cross-origin isolated page (`crossOriginIsolated` and `SharedArrayBuffer`) | Aborting still removes queued requests and closes streams, but a running statement runs to the end. See [cancellation](./queries#cancellation). |
| Parallel reader workers | Multi-tab access, OPFS sync handles with `mode: 'readwrite-unsafe'`, and more than one CPU core | Reads run on the owning engine worker. |

A page is cross-origin isolated when it is served with these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Storage, transactions and multi-tab access work without them.

The engine is designed for Chrome 108, Firefox 111 and Safari 17 and later ([ADR 0002](https://smaltdb.dev/adr/0002-second-round-decisions)). The project's browser test suite runs in Chromium by default. `readwrite-unsafe` handles, which parallel readers need, are a Chromium feature.

## Node and other in-process use

`smaltdb/engine` is the same engine without the worker and the client: a synchronous API that runs in the current thread. Register SQL once, with `smaltql/register`:

```ts
import { Database } from 'smaltdb/engine';
import 'smaltql/register';

const db = Database.openMemory();
db.exec('CREATE TABLE t(a INTEGER PRIMARY KEY, b TEXT)');
db.run('INSERT INTO t(b) VALUES (?)', ['x']);
console.log(db.query('SELECT a, b FROM t')); // { columns: ['a', 'b'], rows: [[1, 'x']] }
db.close();
```

Storage in Node:

- `Database.openMemory()` gives an in-memory database.
- `Database.open(new MemoryVfs(), 'app.db')` gives a file-format database whose files live in the `MemoryVfs` object, in process memory.
- `OpfsVfs` needs OPFS, which Node does not have: opening a file with it rejects with `SMALT_CANTOPEN`.
- smaltdb ships no VFS for the Node file system. To persist to disk, implement the `Vfs` interface (see [the engine API](https://smaltdb.dev/reference/api/engine#vfs)).

[External data](./external-data) and [import and export](./import-export) need plugins, in Node as in the browser. In Node, pass them when you open the database: `Database.openMemory({ plugins: [io, external, parquet] })`. See [plugins](./plugins).

## Next steps

- [Quick start](./quick-start): a short tutorial.
- [Databases](./databases): storage, options, durability, multi-tab access.
- [Queries](./queries): parameters, result shapes, streaming, values.
- [Client API reference](../reference/api/client).
