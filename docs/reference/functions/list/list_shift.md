# list_shift

```ebnf
list_shift ::= 'list_shift' '(' L (',' N)? ')'
```

The elements of the list `L` moved `N` places later (default 1; negative earlier), NULLs filling the places left.

```sql
SELECT list_shift(ARRAY[1, 2, 3]) AS later, list_shift(ARRAY[1, 2, 3], -1) AS earlier;
```

| later | earlier |
| --- | --- |
| [null,1,2] | [2,3,null] |

Related: [`list_diff`](./list_diff).
