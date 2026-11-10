# zeroblob

```ebnf
zeroblob ::= 'zeroblob' '(' N ')'
```

Returns a blob of `N` zero bytes. A negative `N` or NULL gives an empty blob.

```sql
SELECT zeroblob(3) AS a, length(zeroblob(-1)) AS b;
```

| a | b |
| --- | --- |
| x'000000' | 0 |
