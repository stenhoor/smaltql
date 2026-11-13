# list_gather_every

```ebnf
list_gather_every ::= 'list_gather_every' '(' L ',' N (',' FROM)? ')'
```

Every `N`-th element of the list `L`, from position `FROM` (default 1).

`N` must be positive and `FROM` at least 1 (`SMALT_RANGE`).

```sql
SELECT list_gather_every(ARRAY[1, 2, 3, 4, 5, 6, 7], 3) AS every_third, list_gather_every(ARRAY[1, 2, 3, 4, 5, 6, 7], 2, 2) AS even_places;
```

| every_third | even_places |
| --- | --- |
| [1,4,7] | [2,4,6] |

Related: [`list_gather`](./list_gather), [`array_slice`](./array_slice).
