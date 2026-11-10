# skewness_pop

```ebnf
skewness_pop ::= 'skewness_pop' '(' 'DISTINCT'? X ')'
```

The population skewness of the values of `X`, as pandas and Polars compute it with `bias=True`.

NULL when the values have no spread.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (10)) SELECT round(skewness_pop(x), 10) AS s FROM t;
```

| s |
| --- |
| 1.0182337649 |

Related: [`skewness`](./skewness), [`kurtosis`](./kurtosis), [`kurtosis_pop`](./kurtosis_pop).
