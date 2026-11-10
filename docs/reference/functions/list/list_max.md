# list_max

```ebnf
list_max ::= 'list_max' '(' L ')'
```

The greatest of the non-NULL numbers of the list `L`.

A list with no numbers gives NULL. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_max(ARRAY[3, NULL, 1]) AS a, list_max(ARRAY[]) AS b;
```

| a | b |
| --- | --- |
| 3 | NULL |

Related: [`list_sum`](./list_sum), [`list_mean`](./list_mean), [`list_min`](./list_min).
