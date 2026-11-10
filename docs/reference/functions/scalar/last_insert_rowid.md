# last_insert_rowid

```ebnf
last_insert_rowid ::= 'last_insert_rowid' '(' ')'
```

Returns the rowid of the most recent successful `INSERT` on this database connection, or 0 if there has been none.

```sql
CREATE TABLE note(id INTEGER PRIMARY KEY, body TEXT);
INSERT INTO note(body) VALUES ('a'), ('b');
SELECT last_insert_rowid() AS id;
```

| id |
| --- |
| 2 |
