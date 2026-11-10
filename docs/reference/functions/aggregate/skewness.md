# skewness

```ebnf
skewness ::= 'skewness' '(' 'DISTINCT'? X ')'
```

The sample skewness (asymmetry) of the values of `X`, with bias correction, as in DuckDB and Excel (`SKEW`).

It needs three values; NULL when the values have no spread.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (10)) SELECT round(skewness(x), 10) AS s FROM t;
```

| s |
| --- |
| 1.7636326148 |

Related: [`skewness_pop`](./skewness_pop), [`kurtosis`](./kurtosis), [`kurtosis_pop`](./kurtosis_pop).
