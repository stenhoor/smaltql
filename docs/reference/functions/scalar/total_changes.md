# total_changes

```ebnf
total_changes ::= 'total_changes' '(' ')'
```

Returns the number of rows inserted, updated or deleted by all `INSERT`, `UPDATE` and `DELETE` statements since the connection was opened.

```sql
CREATE TABLE note(id INTEGER PRIMARY KEY, body TEXT);
INSERT INTO note(body) VALUES ('a'), ('b'), ('c');
UPDATE note SET body = upper(body) WHERE id > 1;
SELECT last_insert_rowid() AS last_id, changes() AS changed, total_changes() AS total;
```

| last_id | changed | total |
| --- | --- | --- |
| 3 | 2 | 5 |

From JavaScript, `exec()` and a prepared statement's `run()` return `changes` and `lastInsertRowid` too; see [Queries](../../../guide/queries).
