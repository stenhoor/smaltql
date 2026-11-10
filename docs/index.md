---
layout: home

hero:
  name: 'sm<span class="alt">alt</span><span class="suffix language">ql</span>'
  text: 'Small. Alternative.<br>Familiar.'
  tagline: The SQL you know, for smaltdb.
  image:
    light: /star-mark.svg
    dark: /star-mark-on-dark.svg
    alt: smaltql
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Quick start
      link: /guide/quick-start
    - theme: alt
      text: SQL reference
      link: /reference/sql/

features:
  - title: Quick start
    details: Five minutes, three steps, ending in SQL that runs on the page.
    link: /guide/quick-start
    linkText: Start
  - title: Getting started
    details: Installation, a tutorial that builds a small data layer, and the FAQ.
    link: /guide/getting-started
    linkText: Install
  - title: User guide
    details: Databases, queries, transactions, schema, indexes, views, analytics, import and external data.
    link: /guide/databases
    linkText: Read the guide
  - title: Reference
    details: Every statement and function, the client API, and the errors, with tested examples to run.
    link: /reference/sql/
    linkText: Look it up
---

## What smaltql does

- **The SQL you know:** The SQLite dialect, with joins of every kind, CTEs (recursive too), window functions, upserts and RETURNING. [What differs from SQLite →](/guide/sqlite-differences)
- **Strict types:** Tables are STRICT, so a value must fit its column's type. ANY columns hold anything. [Types →](/reference/sql/types)
- **Materialized views:** CREATE, REFRESH and DROP MATERIALIZED VIEW. Queries that a materialized view answers read it instead of the base tables. [Views →](/reference/sql/views)
- **Files and URLs as tables:** read_csv, read_json and read_parquet, and external tables over HTTP, S3 and Azure Blob Storage, queried with plain SQL through plugins. [External tables →](/reference/sql/external)
- **Columnar tables:** WITH (storage = 'columnar') stores a table as compressed column segments with zone maps, for scans and aggregates over many rows. [CREATE TABLE →](/reference/sql/create-table#columnar-tables)
- **Plans you can read:** EXPLAIN shows the plan the engine chose, EXPLAIN ANALYZE what it cost, and information_schema describes every object. [EXPLAIN →](/reference/sql/explain)

## Quick start

```ts
import { open } from '@smaltworks/smaltql';

const db = await open('app');
await db.exec('CREATE TABLE IF NOT EXISTS todo(id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INT DEFAULT 0)');
await db.exec('INSERT INTO todo(title) VALUES (?)', ['write docs']);
const rows = await db.query('SELECT id, title FROM todo WHERE done = 0');
```

## SQL, as you'd write it

```sql
WITH monthly AS (
  SELECT strftime('%Y-%m', sold_at) AS month, region, sum(amount) AS total
  FROM sales
  GROUP BY month, region
)
SELECT month, region, total,
       rank() OVER (PARTITION BY month ORDER BY total DESC) AS place
FROM monthly
ORDER BY month, place;
```

smaltql parses SQL into plans for [smaltdb](https://smaltdb.dev), the engine underneath: it runs them in a Web Worker,
so queries never block the page, and keeps the data in the browser's Origin Private File System.
