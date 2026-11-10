# first

```ebnf
first ::= 'first' '(' ('DISTINCT'? X | X ',' KEY (',' KEY2)?) ')' | 'arg_min' '(' X ',' KEY ')'
```

`X` at one row of the group, chosen by position or by a key. A smaltdb extension.

- **`first(X)`:** `X` at the group's first row, in the order the rows reach the aggregate (sort in a subquery to
  choose it). That value may be NULL.
- **`first(X, KEY)`:** `X` at the row with the least `KEY`. Rows whose `KEY` is NULL are skipped. A second
  key, `KEY2`, breaks ties between equal keys (the row with the least `KEY2`); rows still equal are taken in input
  order, and the earliest wins.
- **`arg_min(X, KEY)`:** the same as `first(X, KEY)`, under the name other databases use.
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
SELECT region, first(qty) AS first_qty, first(qty, price) AS qty_at_lowest_price, arg_min(product, qty) AS smallest_order
FROM sale GROUP BY region ORDER BY region;
```

| region | first_qty | qty_at_lowest_price | smallest_order |
| --- | --- | --- | --- |
| north | 3 | 3 | apple |
| south | 4 | 4 | apple |

Related: [`last`](./last), [`min`](./min), [`max`](./max), and the window functions [`first_value`](../window/first_value) and [`last_value`](../window/last_value).
