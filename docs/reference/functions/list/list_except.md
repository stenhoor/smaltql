# list_except

```ebnf
list_except ::= 'list_except' '(' A ',' B ')'
```

The elements of `A` that aren't in `B`, each once, in order.

NULL is one value. A NULL list gives NULL.

```sql
SELECT list_except(ARRAY['ts', 'sql'], ARRAY['sql', 'go']) AS only_mine;
```

| only_mine |
| --- |
| ["ts"] |

Related: [`list_union`](./list_union), [`list_intersect`](./list_intersect), [`list_symmetric_except`](./list_symmetric_except).
