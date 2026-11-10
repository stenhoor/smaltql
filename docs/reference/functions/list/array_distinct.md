# array_distinct

```ebnf
array_distinct ::= 'array_distinct' '(' L ')'
```

The elements of `L` without repeats: the first of each, in their order. One NULL is kept.

```sql
SELECT array_distinct(ARRAY[2, 1, 2, NULL, 1]) AS once;
```

| once |
| --- |
| [2,1,null] |
