# median

```ebnf
median ::= 'median' '(' 'DISTINCT'? X ')'
```

The median of the values of `X`: `percentile_cont(X, 0.5)`, as in SQLite.

The result is a REAL. A value that is not a number (text, a blob), or an infinite one, is an error, as in SQLite.

```sql
WITH t(x) AS (VALUES (1), (5), (3)) SELECT median(x) AS odd FROM t;
```

| odd |
| --- |
| 3 |

Related: [`percentile`](./percentile), [`percentile_cont`](./percentile_cont), [`percentile_disc`](./percentile_disc).
