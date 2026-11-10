# min

```ebnf
min ::= 'min' '(' 'DISTINCT'? X ')'
```

The smallest non-NULL value of `X`, or NULL when there are none. Values of different types are ordered as in SQLite: numbers, then text, then blobs. Text is compared with the collation of `X` (its column's collation, or one given with `COLLATE`). With two or more arguments `min` is the [scalar function](../scalar/min).

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
SELECT min(product) AS first, min(qty) AS least, min(price) AS cheapest FROM sale;
```

| first | least | cheapest |
| --- | --- | --- |
| apple | 1 | 0.5 |

```sql
SELECT min(x) AS binary, min(x COLLATE NOCASE) AS nocase FROM (SELECT 'b' AS x UNION ALL SELECT 'B' UNION ALL SELECT 'a');
```

| binary | nocase |
| --- | --- |
| B | a |
