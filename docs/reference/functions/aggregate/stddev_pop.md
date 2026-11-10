# stddev_pop

```ebnf
stddev_pop ::= 'stddev_pop' '(' 'DISTINCT'? X ')'
```

The population standard deviation of the non-NULL values of `X`.

No values give NULL.

```sql
WITH t(x) AS (VALUES (1), (2), (3), (4)) SELECT round(stddev_pop(x), 10) AS s FROM t;
```

| s |
| --- |
| 1.1180339887 |

Related: [`var_samp`](./var_samp), [`var_pop`](./var_pop), [`stddev_samp`](./stddev_samp).
