# nullif

```ebnf
nullif ::= 'nullif' '(' X ',' Y ')'
```

Returns NULL when `X` and `Y` are equal, otherwise `X`. The comparison uses the collation of `X` (for example `COLLATE NOCASE`). If either argument is NULL, the result is `X`.

```sql
SELECT nullif(10, 10) AS a, nullif(10, 20) AS b, nullif('a', 'A') AS c, nullif('a' COLLATE NOCASE, 'A') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| NULL | 10 | a | NULL |

A common use is avoiding division by zero:

```sql
SELECT 100 / nullif(0, 0) AS ratio;
```

| ratio |
| --- |
| NULL |
