# list_arg_min

```ebnf
list_arg_min ::= 'list_arg_min' '(' L ')'
```

The position (from 1) of the least non-NULL element of the list `L`.

Of equal elements, the first. NULL for a list with no non-NULL element.

```sql
SELECT list_arg_min(ARRAY[4, 2, NULL, 2]) AS at, list_arg_min(ARRAY[]) AS none;
```

| at | none |
| --- | --- |
| 2 | NULL |

Related: [`list_arg_max`](./list_arg_max), [`list_min`](./list_min), [`list_extract`](./list_extract).
