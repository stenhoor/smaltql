# array_cat

```ebnf
array_cat ::= 'array_cat' '(' A ',' B ')'
```

The elements of `A`, then the elements of `B`.

- **Returns:** a list of their common element type.

```sql
SELECT array_cat(ARRAY[1], ARRAY[2, 3]) AS joined;
```

| joined |
| --- |
| [1,2,3] |
