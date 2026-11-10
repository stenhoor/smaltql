# changes

```ebnf
changes ::= 'changes' '(' ')'
```

Returns the number of rows inserted, updated or deleted by the most recent completed `INSERT`, `UPDATE` or `DELETE` statement on this connection.

```sql
CREATE TABLE note(id INTEGER PRIMARY KEY, body TEXT);
INSERT INTO note(body) VALUES ('a'), ('b'), ('c');
UPDATE note SET body = upper(body) WHERE id > 1;
SELECT changes() AS changed;
```

| changed |
| --- |
| 2 |
