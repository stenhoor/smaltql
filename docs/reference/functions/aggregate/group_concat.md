# group_concat

```ebnf
group_concat ::= 'group_concat' '(' ('DISTINCT'? X | X ',' SEP) ')'
```

The non-NULL values of `X`, converted to text and joined. The separator is `,` (a comma with no space) when `SEP` is omitted. `SEP` is evaluated for each row: the separator placed before a value is the `SEP` of that value's row, and a NULL `SEP` joins with nothing. The result is NULL when there are no non-NULL values.

The order of the values is the order in which rows reach the aggregate, which is not guaranteed. To fix the order, aggregate over a subquery with `ORDER BY`:

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
SELECT group_concat(product) AS a, group_concat(product, ' | ') AS b, group_concat(DISTINCT product) AS c
FROM (SELECT product FROM sale ORDER BY product);
```

| a | b | c |
| --- | --- | --- |
| apple,apple,apple,pear,plum | apple \| apple \| apple \| pear \| plum | apple,pear,plum |

```sql
SELECT region, group_concat(qty, '+') AS parts FROM (SELECT * FROM sale ORDER BY region, qty) GROUP BY region ORDER BY region;
```

| region | parts |
| --- | --- |
| north | 1+2+3 |
| south | 4 |
