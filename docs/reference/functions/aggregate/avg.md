# avg

```ebnf
avg ::= 'avg' '(' 'DISTINCT'? X ')'
```

The average of the non-NULL values of `X`, or NULL when there are none. The result is a REAL (but see the note under [total](./total)). Text and blobs are converted to numbers.

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
SELECT region, avg(qty) AS avg_qty FROM sale GROUP BY region ORDER BY region;
```

| region | avg_qty |
| --- | --- |
| north | 2 |
| south | 4 |

```sql
SELECT avg(x) AS a, avg(DISTINCT x) AS d FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION ALL SELECT 4);
```

| a | d |
| --- | --- |
| 2 | 2.5 |
