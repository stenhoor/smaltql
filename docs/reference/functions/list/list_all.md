# list_all

```ebnf
list_all ::= 'list_all' '(' L ')'
```

1 if every non-NULL element of the list `L` is true, else 0.

A list with no non-NULL element gives 1.

```sql
SELECT list_all(ARRAY[1 = 1, 2 > 1]) AS every, list_all(ARRAY[1 = 1, 1 = 2]) AS not_every, list_all(ARRAY[]) AS none;
```

| every | not_every | none |
| --- | --- | --- |
| 1 | 0 | 1 |

Related: [`list_any`](./list_any).
