# list_sample

```ebnf
list_sample ::= 'list_sample' '(' L ',' N (',' WITH_REPLACEMENT (',' SEED)?)? ')'
```

`N` elements of the list `L` chosen at random.

Without replacement (the default, `WITH_REPLACEMENT` 0) they keep the list's order, and more than the list has fails with `SMALT_RANGE`; with replacement (1) they come in the order drawn. A `SEED` gives the same choice each time.

```sql
SELECT list_sample(ARRAY['A', 'K', 'Q', 'J', '10'], 2, 0, 7) AS hand, cardinality(list_sample(ARRAY[1, 2], 5, 1)) AS drawn;
```

| hand | drawn |
| --- | --- |
| ["A","K"] | 5 |

Related: [`list_gather`](./list_gather), [`array_slice`](./array_slice).
