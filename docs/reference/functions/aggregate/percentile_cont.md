# percentile_cont

```ebnf
percentile_cont ::= 'percentile_cont' '(' X ',' F ')'
```

The percentile `F` of the values of `X`, `F` from 0 to 1, interpolating between the two nearest values.

The result is a REAL. A value that is not a number, or an infinite one, is an error; `F` must be in range and the same on every row.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4)) SELECT percentile_cont(x, 0.5) AS half, percentile_cont(x, 0.9) AS p90 FROM t;
```

| half | p90 |
| --- | --- |
| 2.5 | 3.7 |

Related: [`median`](./median), [`percentile`](./percentile), [`percentile_disc`](./percentile_disc).
