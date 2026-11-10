# cardinality, array_length

```ebnf
cardinality ::= 'cardinality' '(' L ')' | 'array_length' '(' L ')'
```

The number of elements in `L`. The two names are the same function.

- **Returns:** an integer; NULL elements count.
- **NULL:** NULL for a NULL list.

```sql
SELECT cardinality(ARRAY[1, NULL, 3]) AS n, array_length(ARRAY[]) AS none, cardinality(NULL) AS null_list;
```

| n | none | null_list |
| --- | --- | --- |
| 3 | 0 | NULL |
