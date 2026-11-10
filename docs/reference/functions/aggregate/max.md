# max

```ebnf
max ::= 'max' '(' 'DISTINCT'? X ')'
```

The largest non-NULL value of `X`, or NULL when there are none. Ordering and collation work as for `min`.

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
SELECT min(product) AS first, max(product) AS last, min(qty) AS least, max(price) AS dearest FROM sale;
```

| first | last | least | dearest |
| --- | --- | --- | --- |
| apple | plum | 1 | 1.25 |

```sql
SELECT max(x) AS binary, max(x COLLATE NOCASE) AS nocase FROM (SELECT 'b' AS x UNION ALL SELECT 'B' UNION ALL SELECT 'a');
```

| binary | nocase |
| --- | --- |
| b | b |
