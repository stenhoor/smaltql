# likelihood

```ebnf
likelihood ::= 'likelihood' '(' X ',' P ')'
```

Returns `X` unchanged (SQLite's hint that `X` is true with probability `P`; ignored). `P` must be a REAL literal from 0.0 to 1.0, such as `0.9` or `1.0`; anything else, including an integer literal like `1`, fails with `SMALT_ERROR`: `second argument to likelihood() must be a constant between 0.0 and 1.0`, as in SQLite.

```sql
SELECT likely(5) AS a, unlikely('b') AS b, likelihood(7, 0.9) AS c;
```

| a | b | c |
| --- | --- | --- |
| 5 | b | 7 |
