# list_drop_nulls

```ebnf
list_drop_nulls ::= 'list_drop_nulls' '(' L ')'
```

The non-NULL elements of the list `L`, in order.

```sql
SELECT list_drop_nulls(ARRAY[1, NULL, 2, NULL]) AS known;
```

| known |
| --- |
| [1,2] |

Related: [`list_count_matches`](./list_count_matches), [`array_distinct`](./array_distinct).
