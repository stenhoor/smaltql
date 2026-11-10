# array_reverse

```ebnf
array_reverse ::= 'array_reverse' '(' L ')'
```

The elements of `L` in reverse order.

```sql
SELECT array_reverse(ARRAY[1, 2, 3]) AS reversed;
```

| reversed |
| --- |
| [3,2,1] |
