# list_mean

```ebnf
list_mean ::= 'list_mean' '(' L ')'
```

The mean of the non-NULL numbers of the list `L`.

A list with no numbers gives NULL. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_mean(ARRAY[1, 2, 3]) AS a, list_mean(ARRAY[1, NULL, 4]) AS b, list_mean(ARRAY[]) AS c;
```

| a | b | c |
| --- | --- | --- |
| 2 | 2.5 | NULL |

Related: [`list_sum`](./list_sum), [`list_min`](./list_min), [`list_max`](./list_max).
