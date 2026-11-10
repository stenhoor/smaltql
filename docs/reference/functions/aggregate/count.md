# count

```ebnf
count ::= 'count' '(' ('*' | 'DISTINCT'? X) ')'
```

`count(*)` is the number of rows. `count(X)` is the number of rows where `X` is not NULL. `count(DISTINCT X)` is the number of distinct non-NULL values. The result is an integer, and 0 for no rows.

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
SELECT region, count(*) AS n, count(qty) AS with_qty FROM sale GROUP BY region ORDER BY region;
```

| region | n | with_qty |
| --- | --- | --- |
| north | 3 | 3 |
| south | 2 | 1 |
