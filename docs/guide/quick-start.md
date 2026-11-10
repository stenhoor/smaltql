# Quick start

Five minutes, three steps: install smaltql, run SQL from your code, then change a query and run it on this page.

## 1. Install

```sh
npm install @smaltworks/smaltql smaltdb
```

smaltql and smaltdb 0.9.0 are not on npm yet. [Installation](./getting-started) has the entry points and how plugins
add CSV, JSON, Parquet and external data.

## 2. Run SQL from your code

```ts
import { open } from '@smaltworks/smaltql';

const db = await open('shop'); // created in the browser's storage (OPFS) on first use
await db.exec(`CREATE TABLE IF NOT EXISTS fruit(name TEXT PRIMARY KEY, color TEXT NOT NULL, price REAL NOT NULL)`);
await db.exec('INSERT OR REPLACE INTO fruit VALUES (?, ?, ?)', ['apple', 'red', 0.5]);

const rows = await db.query('SELECT name, price FROM fruit WHERE color = ?', ['red']);
console.log(rows); // [{ name: 'apple', price: 0.5 }]
```

`open()` starts the engine in a Web Worker; every call returns a promise.

## 3. Try it here

This is the same kind of SQL, running in your browser. Change it and press **Run** (or Ctrl+Enter); **Reset** brings
back the example, and **Share** copies a link to your version.

```sql play
CREATE TABLE fruit(name TEXT PRIMARY KEY, color TEXT NOT NULL, price REAL NOT NULL);
INSERT INTO fruit VALUES ('apple', 'red', 0.5), ('banana', 'yellow', 0.25), ('cherry', 'red', 3), ('lemon', 'yellow', 0.4);
SELECT color, count(*) AS kinds, round(avg(price), 2) AS average_price
FROM fruit GROUP BY color ORDER BY color;
```

| color | kinds | average_price |
| --- | --- | --- |
| red | 2 | 1.75 |
| yellow | 2 | 0.33 |

The table under the code is the tested result: the docs' tests run every example and check what it prints.

## Next

- [Tutorial](./tutorial): a small data layer, step by step.
- [User guide](./databases): databases, queries, transactions, schema and the rest.
- [SQL reference](../reference/sql/) and [functions](../reference/functions/).
