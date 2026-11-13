# list_gather

```ebnf
list_gather ::= 'list_gather' '(' L ',' POSITIONS ')'
```

The elements of the list `L` at the positions in the list `POSITIONS`: 1 is the first, -1 the last.

A position of 0, NULL, or out of range gives NULL, as [`list_extract`](./list_extract) does.

```sql
SELECT list_gather(ARRAY['plan', 'build', 'test', 'ship'], ARRAY[1, -1]) AS ends, list_gather(ARRAY[10, 20], ARRAY[2, 5]) AS past_end;
```

| ends | past_end |
| --- | --- |
| ["plan","ship"] | [20,null] |

Related: [`list_extract`](./list_extract), [`list_gather_every`](./list_gather_every), [`array_slice`](./array_slice).
