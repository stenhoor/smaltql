# array_to_string

```ebnf
array_to_string ::= 'array_to_string' '(' L ',' SEP ')'
```

The elements of `L` as text, joined by `SEP`. NULL elements are left out.

- **Returns:** text; empty text for an empty list.

```sql
SELECT array_to_string(ARRAY['a', NULL, 'b'], '-') AS joined, array_to_string(ARRAY[1, 2], ', ') AS numbers;
```

| joined | numbers |
| --- | --- |
| a-b | 1, 2 |
