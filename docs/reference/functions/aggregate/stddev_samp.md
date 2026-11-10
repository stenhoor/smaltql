# stddev_samp

```ebnf
stddev_samp ::= ('stddev_samp' | 'stddev') '(' 'DISTINCT'? X ')'
```

The sample standard deviation of the non-NULL values of `X`. `stddev` is the same function.

Fewer than two values give NULL.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4)) SELECT round(stddev_samp(x), 10) AS s, round(stddev(x), 10) AS same FROM t;
```

| s | same |
| --- | --- |
| 1.2909944487 | 1.2909944487 |

Related: [`var_samp`](./var_samp), [`var_pop`](./var_pop), [`stddev_pop`](./stddev_pop).
