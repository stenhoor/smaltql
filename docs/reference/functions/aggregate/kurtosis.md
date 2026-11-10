# kurtosis

```ebnf
kurtosis ::= 'kurtosis' '(' 'DISTINCT'? X ')'
```

The sample excess kurtosis (tailedness: 0 for a normal distribution) of the values of `X`, with bias correction, as in DuckDB and Excel (`KURT`).

It needs four values; NULL when the values have no spread.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (10), (11)) SELECT round(kurtosis(x), 10) AS k FROM t;
```

| k |
| --- |
| -3.0410826681 |

Related: [`skewness`](./skewness), [`skewness_pop`](./skewness_pop), [`kurtosis_pop`](./kurtosis_pop).
