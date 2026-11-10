# percentile

```ebnf
percentile ::= 'percentile' '(' X ',' P ')'
```

The `P`th percentile of the values of `X`, `P` from 0 to 100, interpolating between the two nearest values.

The result is a REAL. A value that is not a number, or an infinite one, is an error; `P` must be in range and the same on every row.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4), (5)) SELECT percentile(x, 50) AS p50, percentile(x, 90) AS p90 FROM t;
```

| p50 | p90 |
| --- | --- |
| 3 | 4.6 |

Related: [`median`](./median), [`percentile_cont`](./percentile_cont), [`percentile_disc`](./percentile_disc).
