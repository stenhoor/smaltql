# list_any

```ebnf
list_any ::= 'list_any' '(' L ')'
```

1 if any non-NULL element of the list `L` is true, else 0.

A list with no non-NULL element gives 0.

```sql
SELECT list_any(ARRAY[1 = 2, 2 > 1]) AS some, list_any(ARRAY[1 = 2]) AS none_true, list_any(ARRAY[]) AS none;
```

| some | none_true | none |
| --- | --- | --- |
| 1 | 0 | 0 |

Related: [`list_all`](./list_all).
