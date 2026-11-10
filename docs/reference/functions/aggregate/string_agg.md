# string_agg

```ebnf
string_agg ::= 'string_agg' '(' X ',' SEP ')'
```

The same as `group_concat(X, SEP)`, with the separator required (the SQL-standard and PostgreSQL name). `string_agg(X)` with one argument fails with `wrong number of arguments`, and `DISTINCT` is not allowed because the function always has two arguments.

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
SELECT string_agg(region, '; ') AS regions FROM (SELECT DISTINCT region FROM sale ORDER BY region);
```

| regions |
| --- |
| north; south |
