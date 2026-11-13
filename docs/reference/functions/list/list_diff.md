# list_diff

```ebnf
list_diff ::= 'list_diff' '(' L (',' N)? ')'
```

Each element of the list `L` less the one `N` places before it (default 1).

The first `N` elements, and any next to a NULL, give NULL. A list of anything but numbers fails with `SMALT_MISMATCH`.

```sql
SELECT list_diff(ARRAY[1200, 1260, 1345]) AS daily, list_diff(ARRAY[1, 4, 9, 16], 2) AS two_back;
```

| daily | two_back |
| --- | --- |
| [null,60,85] | [null,null,8,12] |

Related: [`list_shift`](./list_shift).
