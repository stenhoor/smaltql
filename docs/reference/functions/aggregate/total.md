# total

```ebnf
total ::= 'total' '(' 'DISTINCT'? X ')'
```

Like [`sum`](./sum), but returns 0 instead of NULL when there are no values, and never fails on integer overflow (it switches to REAL arithmetic instead).

The examples on this page use this table:

```sql
CREATE TABLE sale(region TEXT, product TEXT, qty INT, price REAL);
INSERT INTO sale VALUES
  ('north', 'apple',  3, 0.5),
  ('north', 'pear',   2, 0.75),
  ('north', 'apple',  1, 0.5),
  ('south', 'apple',  4, 0.5),
  ('south', 'plum',   NULL, 1.25);
```

```sql
SELECT total(qty) AS none FROM sale WHERE region = 'east';
```

| none |
| --- |
| 0 |

```sql
SELECT total(x) AS t FROM (SELECT 9223372036854775807 AS x UNION ALL SELECT 1);
```

| t |
| --- |
| 9223372036854776000 |

::: warning Differs from SQLite
SQLite's `total()` always returns a REAL. In smaltdb a whole-number result, such as `total(qty)` = 10 over integers, can come back as an INTEGER (`typeof` gives `'integer'`, and JavaScript receives `10` either way). The same applies to `sum` and `avg` over REAL values that add up to a whole number. See [Types](../../sql/types).
:::
