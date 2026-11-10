# Scalar functions

General-purpose scalar functions: NULL handling, conditionals, type inspection, blobs, and information about the last statement. Text functions are on [String functions](../string/), numeric ones on [Math functions](../math/), and date and time functions on [Date and time functions](../datetime/).

Function names are case-insensitive. Calling a function with the wrong number of arguments fails with `SMALT_ERROR` (`wrong number of arguments to function f()`), and an unknown name fails with `no such function: f`. Both errors are raised when the statement is prepared, not when a row is processed.

Some SQL constructs look like functions but are part of the expression grammar. They are documented with the other expressions:

| Construct | Where |
| --- | --- |
| `CAST(x AS type)` | [Expressions](../../sql/expressions) |
| `CASE … END` | [Expressions](../../sql/expressions) |
| `CURRENT_DATE`, `CURRENT_TIME`, `CURRENT_TIMESTAMP` | [Date and time functions](../datetime/current_date) |

## Functions {#functions}

### NULL handling and conditionals

- [`coalesce`](./coalesce): The first argument that is not NULL, or NULL when all of them are NULL.
- [`ifnull`](./ifnull): The two-argument form of `coalesce`: `X` if it is not NULL, otherwise `Y`.
- [`iif`](./iif): `X` when `COND` is true and `Y` otherwise.
- [`nullif`](./nullif): NULL when `X` and `Y` are equal, otherwise `X`.

### Type inspection

- [`typeof`](./typeof): The storage class of `X` as lower-case text: `'null'`, `'integer'`, `'real'`, `'text'` or `'blob'`.

### Scalar min and max

- [`min`](./min): The smallest of two or more arguments, or NULL if any argument is NULL.
- [`max`](./max): The largest of two or more arguments, or NULL if any argument is NULL.

### Blobs

- [`randomblob`](./randomblob): A blob of `N` cryptographically random bytes (from `crypto.getRandomValues`).
- [`zeroblob`](./zeroblob): A blob of `N` zero bytes.

### Planner hints

- [`likely`](./likely): `X` unchanged (SQLite's hint that `X` is usually true; ignored).
- [`unlikely`](./unlikely): `X` unchanged (SQLite's hint that `X` is usually false; ignored).
- [`likelihood`](./likelihood): `X` unchanged (SQLite's hint that `X` is true with probability `P`; ignored).

### Last statement and version

- [`last_insert_rowid`](./last_insert_rowid): The rowid of the most recent successful `INSERT` on this database connection, or 0 if there has been none.
- [`changes`](./changes): The number of rows inserted, updated or deleted by the most recent completed `INSERT`, `UPDATE` or `DELETE` statement on this connection.
- [`total_changes`](./total_changes): The number of rows inserted, updated or deleted by all `INSERT`, `UPDATE` and `DELETE` statements since the connection was opened.
- [`smaltdb_version`](./smaltdb_version): The version of the smaltdb package as text, such as `'0.9.0'` (the `version` in its `package.json`).
