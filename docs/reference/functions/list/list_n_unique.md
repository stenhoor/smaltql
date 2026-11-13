# list_n_unique

```ebnf
list_n_unique ::= 'list_n_unique' '(' L ')'
```

The number of distinct elements of the list `L`, NULL counting as one.

```sql
SELECT list_n_unique(ARRAY[1, 2, 1, NULL, NULL]) AS distinct_values, list_n_unique(ARRAY[]) AS none;
```

| distinct_values | none |
| --- | --- |
| 3 | 0 |

Related: [`array_distinct`](./array_distinct), [`list_count_matches`](./list_count_matches).
