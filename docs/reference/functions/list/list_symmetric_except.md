# list_symmetric_except

```ebnf
list_symmetric_except ::= 'list_symmetric_except' '(' A ',' B ')'
```

The elements of one list but not both, each once: `A`'s, then `B`'s.

NULL is one value. A NULL list gives NULL.

```sql
SELECT list_symmetric_except(ARRAY['a', 'b', 'c'], ARRAY['b', 'c', 'd']) AS changed;
```

| changed |
| --- |
| ["a","d"] |

Related: [`list_union`](./list_union), [`list_intersect`](./list_intersect), [`list_except`](./list_except).
