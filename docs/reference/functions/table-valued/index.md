---
# The examples on this page need the @smaltdb/io and @smaltdb/external plugins and the files the docs tests
# register, which the playgrounds do not load.
playground: false
---

# Table-valued functions

A table-valued function is called in the `FROM` clause and returns rows, like a table. It can be joined, filtered and aliased like any table:

```
SELECT … FROM function(arguments) [[AS] alias] …
```

smaltdb has two kinds:

`generate_series`, `json_each` and `json_tree` are not available; calling them fails with `no such table-valued function`.

## Functions {#functions}

### File readers

- [`read_csv`](./read_csv): A CSV or TSV file as a table (with the `@smaltdb/io` plugin).
- [`read_json`](./read_json): A JSON array or NDJSON file as a table (with the `@smaltdb/io` plugin).
- [`read_parquet`](./read_parquet): A Parquet file as a table (with the `@smaltdb/parquet` plugin).

### Schema

- [`pragma_table_info`](./pragma_table_info): One row per column of `TABLE`: its name, declared type, `NOT NULL`, default and primary-key position.
- [`pragma_table_xinfo`](./pragma_table_xinfo): The rows and columns of `pragma_table_info`, plus a seventh column, `hidden`, as in SQLite.
- [`pragma_index_list`](./pragma_index_list): One row per index on `TABLE`: its name, whether it is unique, where it came from and whether it is partial.
- [`pragma_index_info`](./pragma_index_info): One row per key column of an index: its position in the key and in the table, and its name.
- [`pragma_index_xinfo`](./pragma_index_xinfo): Like `pragma_index_info`, with three more columns, and a final row for the rowid that every index entry also stores:
- [`pragma_foreign_key_list`](./pragma_foreign_key_list): One row per column of each foreign key of `TABLE`.

## Reading files: read_csv, read_json, read_parquet {#reading-files}

These functions read external data straight into a query, without creating a table. They come from [plugins](../../../guide/plugins):

| Function | Plugin |
| --- | --- |
| `read_csv`, `read_json` | `@smaltdb/io` |
| `read_parquet` | `@smaltdb/parquet` |

The location also needs a source plugin: `@smaltdb/external` reads registered files (`file:`), URLs, S3, Azure and local paths in Node. Install the plugins in the engine worker entry (`defineWorker({ languages: [sqlLanguage], plugins: [io, external, parquet] })`, started with `worker: () => new Worker(new URL('./db-worker.ts', import.meta.url), { type: 'module' })`), or in Node with `Database.openMemory({ plugins: [io, external, parquet] })`. Without the plugin a call needs, it fails with `SMALT_PLUGIN_MISSING`, and the message names the plugin.

This section lists their arguments; [External data](../../../guide/external-data) explains locations, connections, credentials, caching and partitioned datasets in full, and [CREATE EXTERNAL TABLE](../../sql/external) gives the same data a permanent name.

```
read_csv(LOCATION [, option => value, …])
read_json(LOCATION [, option => value, …])
read_parquet(LOCATION [, option => value, …])
```

- `LOCATION` is required and must be text. Options follow it as `name => value` pairs; there are no other positional arguments.
- All arguments must be constant expressions (literals, or expressions over literals such as `'file:' || 'a.csv'`). Column references and statement parameters are not allowed (`read_csv() arguments must be constants`).
- Because the data is fetched before the statement runs, a statement that uses these functions must be run asynchronously: through the `smaltdb` client (every call is asynchronous), or with `queryAsync` / `execAsync` on the in-process engine. A synchronous `query` fails with `SMALT_ASYNC_REQUIRED`. See [Engine API](https://smaltdb.dev/reference/api/engine).
- Errors while fetching or parsing the data, and bad option values, fail with `SMALT_EXTERNAL`; the message starts with the call, e.g. `read_csv('file:a.csv'): …`. Bad arguments (a missing location, non-constant arguments, an unknown connection) fail with `SMALT_ERROR`.

### Locations {#locations}

| Location | Reads |
| --- | --- |
| `file:NAME` | A file registered with `registerFile(db, NAME, …)` from `@smaltdb/external/client` (a `Uint8Array`, `ArrayBuffer`, string, `Blob`/`File`, or a file handle). |
| `https://…`, `http://…` | A URL, fetched with `fetch` (the server must allow CORS in a browser). |
| `s3://bucket/key` | An object in S3 or an S3-compatible store, through an `s3` connection or the default endpoint. |
| `az://container/path` | A blob in Azure Blob Storage, through an `azure` connection. |
| a path such as `data/x.csv` | In Node.js, a local file. With a `connection` option, a path relative to the connection. |

A location may contain wildcards (`*`, `**`, `?`, `[…]`, `{a,b}`) when the source can be listed (registered files, local paths, S3, Azure; not plain HTTP). All matching files are read and their rows combined, matching columns by name.

```sql
SELECT * FROM read_csv('file:fn-part-*.csv') ORDER BY month;
```

| month | sales |
| --- | --- |
| 2024-01 | 100 |
| 2024-02 | 140 |

### Options {#options}

Option names are case-insensitive. An unknown option fails with `unknown option 'name'`, so typos are caught.

| Option | Applies to | Default | Meaning |
| --- | --- | --- | --- |
| `format` | all | from the function | `'csv'`, `'tsv'`, `'json'` (also `'ndjson'`, `'jsonl'`) or `'parquet'`. Overrides the function's own format, so `read_csv(…, format => 'json')` reads JSON. |
| `header` | CSV | true | Whether the first record holds the column names. False names the columns `column1`, `column2`, …. `1`/`0`, `true`/`false`, `'yes'`/`'no'`, `'on'`/`'off'` are accepted. |
| `delimiter` | CSV | `','` (`'\t'` for `.tsv` files and `format => 'tsv'`) | The field separator. One character. |
| `quote` | CSV | `'"'` | The quote character. One character. A quote inside a quoted field is written twice. |
| `null` | CSV | none | Unquoted text that reads as NULL, e.g. `'NA'` or `'\N'`. An unquoted empty field is always NULL. |
| `skip` | CSV | 0 | Number of records to skip before the header (e.g. a comment line). |
| `encoding` | CSV, JSON | `'utf-8'` | Text encoding, any label `TextDecoder` accepts (`'latin1'`, `'utf-16le'`, `'windows-1252'`, …). |
| `hive_partitioning` | all | true when the location has wildcards | Read `key=value` directory names in the path as extra columns. |
| `connection` | all | none | Name of a connection created with [CREATE CONNECTION](../../sql/external); the location is resolved against it. |

The options accepted are those of every installed format. So with `@smaltdb/io` installed, CSV options given to `read_json` or `read_parquet` are accepted and ignored.

## Schema functions: pragma_* {#pragma-functions}

These are the table-valued forms of the schema [pragmas](../../sql/pragmas): `SELECT * FROM pragma_table_info('t')` returns the same rows as `PRAGMA table_info(t)`. Unlike the `PRAGMA` statement, they can be filtered, joined and used in subqueries. [information_schema](../../sql/information-schema) has the same information in standard form.

- The argument is a table or index name as text. Unlike `PRAGMA table_info('nope')`, which fails, an unknown name gives no rows.
- The argument may come from another table in the same `FROM`, for example to list the columns of every table (see the example under [pragma_table_info](./pragma_table_info)).
- Only these six pragmas have a function form. A `main.` or `temp.` prefix (`main.pragma_table_info(…)`) is accepted and, as in SQLite, changes nothing. Functions such as `pragma_foreign_keys()`, and the forms without parentheses (`pragma_index_list WHERE arg = 't'`), are not supported.
- For an [external table](../../sql/external), `pragma_table_info` lists its columns (declared or inferred; `notnull`, `dflt_value` and `pk` are 0 or NULL), and `pragma_index_list` and `pragma_foreign_key_list` give no rows.
