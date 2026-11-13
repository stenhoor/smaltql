# list_union

```ebnf
list_union ::= 'list_union' '(' A ',' B ')'
```

The elements of either list, each once: `A`'s in order, then `B`'s that are new.

NULL is one value. A NULL list gives NULL.

```sql
SELECT list_union(ARRAY['ts', 'sql'], ARRAY['sql', 'go']) AS skills;
```

| skills |
| --- |
| ["ts","sql","go"] |

Related: [`list_intersect`](./list_intersect), [`list_except`](./list_except), [`list_symmetric_except`](./list_symmetric_except).
