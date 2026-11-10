# var_pop

```ebnf
var_pop ::= 'var_pop' '(' 'DISTINCT'? X ')'
```

The population variance of the non-NULL values of `X`.

Divided by n.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4)) SELECT var_pop(x) AS v FROM t;
```

| v |
| --- |
| 1.25 |

Related: [`var_samp`](./var_samp), [`stddev_samp`](./stddev_samp), [`stddev_pop`](./stddev_pop).
