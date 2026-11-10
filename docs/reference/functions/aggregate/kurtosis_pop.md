# kurtosis_pop

```ebnf
kurtosis_pop ::= 'kurtosis_pop' '(' 'DISTINCT'? X ')'
```

The population excess kurtosis of the values of `X`, as pandas and Polars compute it with `bias=True`.

NULL when the values have no spread.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (10), (11)) SELECT round(kurtosis_pop(x), 10) AS k FROM t;
```

| k |
| --- |
| -1.760270667 |

Related: [`skewness`](./skewness), [`skewness_pop`](./skewness_pop), [`kurtosis`](./kurtosis).
