# list_extract

```ebnf
list_extract ::= 'list_extract' '(' L ',' I ')'
```

The element of `L` at position `I`: 1 is the first, -1 the last.

- **Returns:** a value of the list's element type.
- **NULL:** NULL when `I` is 0 or out of range, and for a NULL list or position.

```sql
SELECT list_extract(ARRAY[10, 20, 30], 1) AS first, list_extract(ARRAY[10, 20, 30], -1) AS last,
       list_extract(ARRAY[10, 20, 30], 0) AS zero, list_extract(ARRAY[10, 20, 30], 5) AS out_of_range;
```

| first | last | zero | out_of_range |
| --- | --- | --- | --- |
| 10 | 30 | NULL | NULL |
