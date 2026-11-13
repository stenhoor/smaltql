# list_arg_max

```ebnf
list_arg_max ::= 'list_arg_max' '(' L ')'
```

The position (from 1) of the greatest non-NULL element of the list `L`.

Of equal elements, the first. NULL for a list with no non-NULL element.

```sql
SELECT list_arg_max(ARRAY[4, 9, 9, 1]) AS at, list_arg_max(ARRAY[NULL]) AS none;
```

| at | none |
| --- | --- |
| 2 | NULL |

Related: [`list_arg_min`](./list_arg_min), [`list_max`](./list_max), [`list_extract`](./list_extract).
