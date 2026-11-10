# array_sort

```ebnf
array_sort ::= 'array_sort' '(' L ')'
```

The elements of `L` in ascending order, NULLs first.

```sql
SELECT array_sort(ARRAY[2, NULL, 1]) AS sorted, array_sort(ARRAY['pear', 'apple']) AS words;
```

| sorted | words |
| --- | --- |
| [null,1,2] | ["apple","pear"] |
