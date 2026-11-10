# corr

```ebnf
corr ::= 'corr' '(' Y ',' X ')'
```

Pearson's correlation coefficient of the pairs (`Y`, `X`), from -1 to 1.

Rows where `Y` or `X` is NULL are skipped. NULL when either has no spread.

```sql
WITH t(x, y) AS (VALUES (1, 2), (2, 4), (3, 7)) SELECT round(corr(y, x), 10) AS r FROM t;
```

| r |
| --- |
| 0.9933992678 |

Related: [`covar_samp`](./covar_samp), [`covar_pop`](./covar_pop).
