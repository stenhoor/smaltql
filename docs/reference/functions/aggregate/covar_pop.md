# covar_pop

```ebnf
covar_pop ::= 'covar_pop' '(' Y ',' X ')'
```

The population covariance of the pairs (`Y`, `X`).

Rows where `Y` or `X` is NULL are skipped.

```sql
WITH t(x, y) AS (VALUES (1, 2), (2, 4), (3, 7)) SELECT round(covar_pop(y, x), 10) AS c FROM t;
```

| c |
| --- |
| 1.6666666667 |

Related: [`covar_samp`](./covar_samp), [`corr`](./corr).
