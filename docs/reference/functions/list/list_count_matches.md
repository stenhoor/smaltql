# list_count_matches

```ebnf
list_count_matches ::= 'list_count_matches' '(' L ',' V ')'
```

The number of elements of the list `L` equal to `V`.

A NULL `V` counts the NULL elements.

```sql
SELECT list_count_matches(ARRAY['yes', 'no', 'yes'], 'yes') AS yes, list_count_matches(ARRAY[1, NULL, NULL], NULL) AS nulls;
```

| yes | nulls |
| --- | --- |
| 2 | 2 |

Related: [`array_contains`](./array_contains), [`list_n_unique`](./list_n_unique).
