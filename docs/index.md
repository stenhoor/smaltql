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
  - title: The SQL you know
    details: The SQLite dialect, with joins of every kind, CTEs (recursive too), window functions, upserts and RETURNING.
    link: /guide/sqlite-differences
    linkText: What differs from SQLite
  - title: Strict types
    details: Tables are STRICT, so a value must fit its column's type. ANY columns hold anything.
    link: /reference/sql/types
    linkText: Types
  - title: Materialized views
    details: CREATE, REFRESH and DROP MATERIALIZED VIEW. Queries that a materialized view answers read it instead of the base tables.
    link: /reference/sql/views
    linkText: Views
  - title: Files and URLs as tables
    details: read_csv, read_json and read_parquet, and external tables over HTTP, S3 and Azure Blob Storage, queried with plain SQL through plugins.
    link: /reference/sql/external
    linkText: External tables
  - title: Columnar tables
    details: "WITH (storage = 'columnar') stores a table as compressed column segments with zone maps, for scans and aggregates over many rows."
    link: /reference/sql/create-table#columnar-tables
    linkText: CREATE TABLE
  - title: Plans you can read
    details: EXPLAIN shows the plan the engine chose, EXPLAIN ANALYZE what it cost, and information_schema describes every object.
    link: /reference/sql/explain
    linkText: EXPLAIN
---

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
