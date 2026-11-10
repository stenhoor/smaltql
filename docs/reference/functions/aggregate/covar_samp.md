# covar_samp

```ebnf
covar_samp ::= 'covar_samp' '(' Y ',' X ')'
```

The sample covariance of the pairs (`Y`, `X`).

Rows where `Y` or `X` is NULL are skipped.

```sql
WITH t(x, y) AS (VALUES (1, 2), (2, 4), (3, 7)) SELECT covar_samp(y, x) AS c FROM t;
```

| c |
| --- |
| 2.5 |

Related: [`covar_pop`](./covar_pop), [`corr`](./corr).
