# mod

```ebnf
mod ::= 'mod' '(' X ',' Y ')'
```

The remainder of `X` divided by `Y`, with the sign of `X`, as a REAL. Unlike the `%` operator, it keeps the fractional part (`mod(7.5, 2)` is 1.5, `7.5 % 2` is 1). NULL when `Y` is 0.

```sql
SELECT mod(7, 3) AS a, mod(-7, 3) AS b, mod(7.5, 2) AS c, mod(7, 0) AS d, typeof(mod(7, 3)) AS e, 7 % 3 AS f;
```

| a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- |
| 1 | -1 | 1.5 | NULL | real | 1 |
