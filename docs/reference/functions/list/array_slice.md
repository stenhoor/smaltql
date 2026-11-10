# array_slice

```ebnf
array_slice ::= 'array_slice' '(' L ',' FROM ',' TO ')'
```

The elements of `L` from position `FROM` to position `TO`, both included. Positions count from 1, and negative ones from the end (`-1` is the last element). Positions past either end are clamped; 0 counts as the start.

- **Returns:** a list of the same type, empty when `FROM` comes after `TO`. NULL when a position is NULL.

```sql
SELECT array_slice(ARRAY[1, 2, 3, 4], 2, 3) AS middle, array_slice(ARRAY[1, 2, 3, 4], -2, -1) AS last_two,
       array_slice(ARRAY[1, 2, 3, 4], 2, -1) AS from_second, array_slice(ARRAY[1, 2, 3, 4], 3, 2) AS empty;
```

| middle | last_two | from_second | empty |
| --- | --- | --- | --- |
| [2,3] | [3,4] | [2,3,4] | [] |
