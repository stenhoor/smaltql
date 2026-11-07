<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/lockup-on-dark.svg">
    <img alt="smaltql" src="docs/brand/lockup.svg" width="320">
  </picture>
</h1>

<a href="https://smaltworks.dev/stability"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/brand/work-in-progress-on-dark.svg"><img alt="Work in progress. Come build with us." src="docs/brand/work-in-progress.svg" height="56"></picture></a>

**Small. Alternative. Familiar.** The SQL you know, for smaltdb.

SQL for [smaltdb](https://github.com/stenhoor/smaltdb): the SQLite dialect, parsed and bound to smaltdb plans.

[Documentation](https://stenhoor.github.io/smaltql/) (guide, SQL and functions reference, client API) ·
[smaltworks.dev](https://smaltworks.dev). The engine is documented at [smaltdb.dev](https://smaltdb.dev).

smaltdb is an embedded database engine for browsers. It runs plans, not text: a language turns its source into plans
and registers with the engine. smaltql is that language for SQL.

In a page, `open()` gives a database whose engine worker reads SQL:

```ts
import { open } from '@smaltworks/smaltql';

const db = await open('app');
await db.query('SELECT 1 + 1');
```

The worker is `@smaltworks/smaltql/worker`, loaded with `new URL(..., import.meta.url)`, so a bundler (Vite, webpack, esbuild)
builds it. An application that also uses plugins writes its own worker entry and passes it to `open()`:

```ts
// db-worker.ts
import { defineWorker } from 'smaltdb/worker-runtime';
import { sqlLanguage } from '@smaltworks/smaltql';
import parquet from '@smaltdb/parquet';
defineWorker({ languages: [sqlLanguage], plugins: [parquet] });

// app.ts
const db = await open('app', { worker: () => new Worker(new URL('./db-worker.ts', import.meta.url), { type: 'module' }) });
```

With the engine in the same thread (Node, or a worker of your own), register SQL and use smaltdb's engine directly:

```ts
import { Database } from 'smaltdb/engine';
import '@smaltworks/smaltql/register';

Database.openMemory().query('SELECT 1 + 1').rows; // [[2]]
```

`@smaltworks/smaltql` also exports `sqlLanguage` and the parser (`parse`, `parseOne`, `parseExpr`, `SqlSyntaxError`). It is in
development, with smaltdb 0.9.0; neither is on npm yet.

<a href="https://smaltworks.dev"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/brand/a-smaltworks-project-on-dark.svg"><img alt="A smaltworks project" src="docs/brand/a-smaltworks-project.svg" height="28"></picture></a>

MIT License.
