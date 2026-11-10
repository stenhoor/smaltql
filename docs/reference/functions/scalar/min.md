# min

```ebnf
min ::= 'min' '(' X (',' Y)+ ')'
```

With two or more arguments, `min` is a scalar function that returns the smallest argument. It returns NULL if any argument is NULL. Values of different types compare in SQLite's order: NULL, then numbers, then text, then blobs. Text compares with the collation of the first argument.

With one argument, `min` is the [aggregate function](../aggregate/min).

```sql
SELECT min(3, 1, 2) AS a, min(2.5, 3) AS b, min(1, 'a') AS c, min(1, NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 1 | 2.5 | 1 | NULL |
