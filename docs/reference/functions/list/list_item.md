# list_item

```ebnf
list_item ::= 'list_item' '(' L ')'
```

The one element of the list `L`.

A list of any other length fails with `SMALT_RANGE`.

```sql
SELECT list_item(ARRAY['ana']) AS owner, list_item(ARRAY[NULL]) AS unknown;
```

| owner | unknown |
| --- | --- |
| ana | NULL |

Related: [`list_extract`](./list_extract), [`cardinality`](./cardinality).
