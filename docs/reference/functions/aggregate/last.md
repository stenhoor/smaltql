# last

```ebnf
last ::= 'last' '(' ('DISTINCT'? X | X ',' KEY (',' KEY2)?) ')' | 'arg_max' '(' X ',' KEY ')'
```

`X` at one row of the group, chosen by position or by a key. A smaltdb extension.

- **`last(X)`:** `X` at the group's last row, in the order the rows reach the aggregate (sort in a subquery to
  choose it). That value may be NULL.
- **`last(X, KEY)`:** `X` at the row with the greatest `KEY`. Rows whose `KEY` is NULL are skipped. A second
  key, `KEY2`, breaks ties between equal keys (the row with the greatest `KEY2`); rows still equal are taken in input
  order, and the latest wins.
- **`arg_max(X, KEY)`:** the same as `last(X, KEY)`, under the name other databases use.
- **Returns:** a value of `X`'s type; NULL for an empty group.

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
SELECT region, last(qty) AS last_qty, last(qty, price) AS qty_at_highest_price, arg_max(product, price) AS dearest
FROM sale GROUP BY region ORDER BY region;
```

| region | last_qty | qty_at_highest_price | dearest |
| --- | --- | --- | --- |
| north | 1 | 2 | pear |
| south | NULL | NULL | plum |

Related: [`first`](./first), [`min`](./min), [`max`](./max), and the window functions [`first_value`](../window/first_value) and [`last_value`](../window/last_value).
