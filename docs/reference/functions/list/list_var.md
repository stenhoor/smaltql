# list_var

```ebnf
list_var ::= 'list_var' '(' L (',' DDOF)? ')'
```

The variance of the non-NULL numbers of the list `L`.

`DDOF` (default 1, a sample) is taken from the count; 0 gives the population's. NULL when there are no more numbers than `DDOF`.

```sql
SELECT list_var(ARRAY[2, 4, 6]) AS sample, list_var(ARRAY[2, 4, 6], 0) AS population;
```

| sample | population |
| --- | --- |
| 4 | 2.6666666666666665 |

Related: [`list_std`](./list_std), [`list_median`](./list_median), [`list_mean`](./list_mean).
