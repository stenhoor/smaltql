# list_sum

```ebnf
list_sum ::= 'list_sum' '(' L ')'
```

The sum of the non-NULL numbers of the list `L`.

A list with no numbers gives 0. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_sum(ARRAY[1, 2, 3]) AS a, list_sum(ARRAY[1, NULL, 2.5]) AS b, list_sum(ARRAY[]) AS c, list_sum(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 6 | 3.5 | 0 | NULL |

Related: [`list_mean`](./list_mean), [`list_min`](./list_min), [`list_max`](./list_max).
