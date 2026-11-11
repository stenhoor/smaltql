# sum

```ebnf
sum ::= 'sum' '(' 'DISTINCT'? X ')'
```

The sum of the non-NULL values of `X`, or NULL when there are none. If every value is an integer, the sum is an exact 64-bit integer and fails with `SMALT_ERROR`: `integer overflow` if it does not fit. If any value is a REAL, the result is a REAL, computed with compensated (Kahan–Babuška–Neumaier) summation as in SQLite 3.43 and later. Text and blobs are converted to numbers (non-numeric text counts as 0).

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
SELECT sum(qty) AS units, sum(qty * price) AS revenue, sum(0.1) AS tenths FROM sale;
```

| units | revenue | tenths |
| --- | --- | --- |
| 10 | 5.5 | 0.5 |

```sql
SELECT sum(qty) AS none FROM sale WHERE region = 'east';
```

| none |
| --- |
| NULL |
