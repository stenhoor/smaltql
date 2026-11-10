# coalesce

```ebnf
coalesce ::= 'coalesce' '(' X (',' Y)+ ')'
```

Returns the first argument that is not NULL, or NULL when all of them are NULL. It takes at least two arguments.

```sql
SELECT coalesce(NULL, NULL, 'third', 'fourth') AS a, coalesce(NULL, NULL) AS b;
```

| a | b |
| --- | --- |
| third | NULL |
