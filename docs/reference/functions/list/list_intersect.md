# list_intersect

```ebnf
list_intersect ::= 'list_intersect' '(' A ',' B ')'
```

The elements of both lists, each once, in `A`'s order.

NULL is one value. A NULL list gives NULL.

```sql
SELECT list_intersect(ARRAY['ts', 'sql'], ARRAY['sql', 'go']) AS shared;
```

| shared |
| --- |
| ["sql"] |

Related: [`list_union`](./list_union), [`list_except`](./list_except), [`list_symmetric_except`](./list_symmetric_except).
