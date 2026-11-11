# DROP

`DROP` removes a table, index, view, materialized view, external table or connection.

## Syntax

```railroad
drop-stmt
```

Without `IF EXISTS`, dropping something that does not exist fails with `SMALT_ERROR` (`no such table: x`, `no such index: x`, `no such view: x`, `no such materialized view: x`, `no such external table: x`, `no such connection: x`). With it, nothing happens.

The statement must match the kind of object: `DROP TABLE` on a view fails with `use DROP VIEW to delete view v`, and likewise for the other kinds.

```sql
CREATE TABLE t(a INTEGER);
CREATE VIEW v AS SELECT a FROM t;
DROP TABLE IF EXISTS nothing_here;
```

<!-- docs:error SMALT_ERROR -->
```sql
DROP TABLE v
```

## DROP TABLE

Removes the table, its rows and its indexes. A view that reads it holds it: the drop fails with `SMALT_ERROR`
(`schema change breaks the interface of view v: it no longer binds (no such table: t)`), so the view is dropped first
(views keep the columns they were made with: [smaltdb ADR 0027](https://smaltdb.dev/adr/0027-view-interfaces)). A view
made before view interfaces is kept, and fails when used (`no such table`), as in SQLite.

`CASCADE` after the name drops the views that would break with it, and then the views those break; `RESTRICT`, the
default, fails instead (as in PostgreSQL). It works the same for `DROP VIEW`.

If other tables have foreign keys that reference it and enforcement is on, its rows are deleted first, applying their `ON DELETE` actions; the drop fails if that violates a constraint (as in SQLite).

When a TEMP table shadows a main table of the same name, `DROP TABLE name` drops the TEMP table and `DROP TABLE main.name` the main one.

<!-- docs:error SMALT_ERROR -->
```sql
DROP TABLE t
```

```sql
DROP TABLE t CASCADE;
SELECT count(*) AS objects FROM sqlite_schema
```

| objects |
| --- |
| 0 |

## DROP INDEX

Removes an index created with [CREATE INDEX](./create-index). The indexes behind `PRIMARY KEY` and `UNIQUE` constraints (`smalt_autoindex_…`) cannot be dropped: `index associated with UNIQUE or PRIMARY KEY constraint cannot be dropped`.

## DROP VIEW, DROP MATERIALIZED VIEW

`DROP VIEW` removes a view (a TEMP view first, if one has the name). `DROP MATERIALIZED VIEW` removes a materialized view with its stored rows and indexes. See [Views](./views).

## DROP EXTERNAL TABLE, DROP CONNECTION

`DROP EXTERNAL TABLE` removes the catalog entry only; it never touches the source file. `DROP CONNECTION` fails while an external table uses the connection: `connection c is used by external table x`. See [External tables](./external).

## Not supported

`DROP TRIGGER` fails with `SMALT_UNSUPPORTED` (there are no triggers).

<!-- docs:error SMALT_UNSUPPORTED -->
```sql
DROP TRIGGER IF EXISTS audit
```
