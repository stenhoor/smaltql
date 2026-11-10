# For AI agents

This page is written for AI agents that write code with smaltql, and it opens the agent guide. The site publishes
Markdown made for agents beside its pages:

- [`/agents.md`](https://stenhoor.github.io/smaltql/agents.md): this page, then the SQL reference, every function, the
  errors and the differences from SQLite, in one file. Every example in it is tested, with its result.
- [`/llms.txt`](https://stenhoor.github.io/smaltql/llms.txt): an index of every page, each as Markdown.
- Any page as Markdown: its address with `.md`, such as
  [`guide/queries.md`](https://stenhoor.github.io/smaltql/guide/queries.md).

## What smaltql is

smaltql is SQL for smaltdb, an embedded database for web pages. The SQL is SQLite's dialect, with the differences
listed in [Differences from SQLite](./sqlite-differences). The engine runs in a Web Worker and keeps data in the
browser's Origin Private File System (OPFS), or in memory. The packages are `@smaltworks/smaltql` and `smaltdb`, its
peer dependency; neither is on npm yet.

## How to use it

```ts
import { open } from '@smaltworks/smaltql';
import { SmaltdbError } from 'smaltdb';

const db = await open('app'); // OPFS; open('app', { storage: 'memory' }) keeps nothing
await db.exec('CREATE TABLE IF NOT EXISTS item(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)');
try {
  await db.exec('INSERT INTO item(name) VALUES (?)', ['tea']);
} catch (e) {
  if (!(e instanceof SmaltdbError && e.code === 'SMALT_CONSTRAINT_UNIQUE')) throw e;
}
const rows = await db.query('SELECT id, name FROM item WHERE name = ?', ['tea']); // [{ id: 1, name: 'tea' }]
await db.transaction(async (tx) => {
  await tx.exec('UPDATE item SET name = ? WHERE id = ?', ['green tea', rows[0].id]);
});
await db.close();
```

- **Every call returns a promise.** `query` returns rows as objects (`{ rowMode: 'array' }` for arrays with
  `columns`); `exec` runs statements for their effect and returns `changes` and `lastInsertRowid`; `prepare` and
  `stream` are in [Queries](./queries).
- **Pass values as parameters** (`?`, `?NNN`, `:name`, `@name`, `$name`), never by building SQL text.
- **Run statements through `tx` inside `db.transaction()`.** Awaiting a call on `db` inside the callback never
  finishes: the database waits for the transaction to end.
- **Errors** reject with a `SmaltdbError`. Branch on its `code` (`SMALT_CONSTRAINT_UNIQUE`, `SMALT_SYNTAX`, …), never
  on its `message`, whose wording may change. The codes are in [Errors](./errors).

## Rules that differ from SQLite

- **Tables are STRICT.** A value is converted to its column's type only when nothing is lost; otherwise the statement
  fails with `SMALT_CONSTRAINT_DATATYPE`. Use an `ANY` column for values of mixed types.
- **Foreign keys are enforced** by default.
- **A double-quoted name that is not a column is an error**, not a string: write strings in single quotes.
- **Not supported**, with what to use instead: [the table in Differences from
  SQLite](./sqlite-differences#not-supported). Among them: triggers, `ATTACH`, `CREATE TABLE … AS SELECT` (create the
  table, then `INSERT … SELECT`), `UPDATE` / `DELETE` with `LIMIT`, row values, JSON functions and most `PRAGMA`s.
- **Functions SQLite doesn't have** (dates and time zones, lists, regular expressions, `first` / `last`) are listed in
  [smaltdb extensions](../reference/functions/extensions).

## Data from files and URLs

CSV, JSON, Parquet and external data (URLs, S3, Azure Blob Storage) are plugins, installed and registered in an engine
worker of your own: see [Plugins](./plugins). Without the plugin, `read_csv`, `read_json` and `read_parquet` fail
with `SMALT_PLUGIN_MISSING`, and the message names the plugin to add.
