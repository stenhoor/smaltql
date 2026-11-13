# list_median

```ebnf
list_median ::= 'list_median' '(' L ')'
```

The median of the non-NULL numbers of the list `L`.

A list with no numbers gives NULL; an even count gives the mean of the middle two. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_median(ARRAY[3, 1, 2]) AS odd, list_median(ARRAY[4, 1, NULL, 2, 3]) AS even, list_median(ARRAY[]) AS none;
```

| odd | even | none |
| --- | --- | --- |
| 2 | 2.5 | NULL |

Related: [`list_std`](./list_std), [`list_var`](./list_var), [`list_mean`](./list_mean).
