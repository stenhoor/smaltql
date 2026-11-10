# sqrt

```ebnf
sqrt ::= 'sqrt' '(' X ')'
```

The square root of `X`. NULL for a negative `X`.

```sql
SELECT sqrt(16) AS a, sqrt(2) AS b, sqrt(-1) AS c, typeof(sqrt(16)) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 4 | 1.4142135623730951 | NULL | real |
