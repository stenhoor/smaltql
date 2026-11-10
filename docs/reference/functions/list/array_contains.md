# array_contains, = ANY

```ebnf
array_contains ::= 'array_contains' '(' L ',' V ')' | V '=' 'ANY' '(' L ')'
```

1 if an element of `L` equals `V`, else 0.

- **Returns:** 1 or 0.
- **NULL:** the two differ.
  - `V = ANY (L)` is three-valued, as in PostgreSQL and as SQL's `IN` is. It is NULL for a NULL `V` or list, and when no element equals `V` but `L` holds a NULL.
  - `array_contains` is NULL for a NULL list only. A NULL `V` asks whether the list has a NULL element, so it gives 1 or 0.

```sql
SELECT array_contains(ARRAY[1, 2], 2) AS has_two, 3 = ANY (ARRAY[1, 2]) AS has_three,
       3 = ANY (ARRAY[1, NULL]) AS maybe, array_contains(ARRAY[1, NULL], NULL) AS has_null;
```

| has_two | has_three | maybe | has_null |
| --- | --- | --- | --- |
| 1 | 0 | NULL | 1 |
