# array_agg, implode

```ebnf
array_agg ::= ('array_agg' | 'implode') '(' 'DISTINCT'? X ')'
```

An aggregate: the values of `X` in a group, as a list, in the order the rows reach it. NULLs are kept. The two names
are the same function.

- **Returns:** a list; an empty group gives an empty list.

The examples on this page use this table:

```sql
CREATE TABLE basket(id INT, items TEXT);
INSERT INTO basket VALUES (1, 'apple'), (1, 'pear'), (1, 'apple'), (2, 'plum');
```

```sql
SELECT id, array_agg(items) AS items FROM basket GROUP BY id ORDER BY id;
```

| id | items |
| --- | --- |
| 1 | ["apple","pear","apple"] |
| 2 | ["plum"] |

```sql
SELECT implode(x) AS with_nulls FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3);
```

| with_nulls |
| --- |
| [1,null,3] |
