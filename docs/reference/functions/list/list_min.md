# list_min

```ebnf
list_min ::= 'list_min' '(' L ')'
```

The least of the non-NULL numbers of the list `L`.

A list with no numbers gives NULL. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_min(ARRAY[3, NULL, 1]) AS a, list_min(ARRAY[]) AS b;
```

| a | b |
| --- | --- |
| 1 | NULL |

Related: [`list_sum`](./list_sum), [`list_mean`](./list_mean), [`list_max`](./list_max).
