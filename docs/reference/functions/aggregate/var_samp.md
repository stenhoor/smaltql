# var_samp

```ebnf
var_samp ::= ('var_samp' | 'variance') '(' 'DISTINCT'? X ')'
```

The sample variance of the non-NULL values of `X`. `variance` is the same function.

Divided by n − 1; fewer than two values give NULL.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4)) SELECT var_samp(x) AS v, variance(x) AS same FROM t;
```

| v | same |
| --- | --- |
| 1.6666666666666667 | 1.6666666666666667 |

Related: [`var_pop`](./var_pop), [`stddev_samp`](./stddev_samp), [`stddev_pop`](./stddev_pop).
