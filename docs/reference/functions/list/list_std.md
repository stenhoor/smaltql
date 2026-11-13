# list_std

```ebnf
list_std ::= 'list_std' '(' L (',' DDOF)? ')'
```

The standard deviation of the non-NULL numbers of the list `L`.

`DDOF` (default 1, a sample) is taken from the count; 0 gives the population's. NULL when there are no more numbers than `DDOF`.

```sql
SELECT list_std(ARRAY[2, 4, 6]) AS sample, list_std(ARRAY[2, 4, 6], 0) AS population, list_std(ARRAY[5]) AS one;
```

| sample | population | one |
| --- | --- | --- |
| 2 | 1.632993161855452 | NULL |

Related: [`list_var`](./list_var), [`list_median`](./list_median), [`list_mean`](./list_mean).
