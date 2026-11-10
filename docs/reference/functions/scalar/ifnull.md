# ifnull

```ebnf
ifnull ::= 'ifnull' '(' X ',' Y ')'
```

The two-argument form of `coalesce`: `X` if it is not NULL, otherwise `Y`.

```sql
SELECT ifnull(NULL, 'fallback') AS a, ifnull(0, 'fallback') AS b;
```

| a | b |
| --- | --- |
| fallback | 0 |
