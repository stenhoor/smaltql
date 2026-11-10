# unnest

```ebnf
unnest ::= 'SELECT' result-column (',' result-column)* 'FROM' 'unnest' '(' L ')' ('AS'? name)?
```

A table function: one row per element of `L`, in order, in a column named `unnest` (or the alias). See
[`unnest` in FROM](../../sql/select#unnest) for its options.

```sql
SELECT * FROM unnest(ARRAY[10, 20, 30]);
```

| unnest |
| --- |
| 10 |
| 20 |
| 30 |
