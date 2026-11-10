# ntile

```ebnf
ntile ::= 'ntile' '(' N ')' 'OVER' window-spec
```

Splits the partition into `N` buckets of nearly equal size and returns the bucket number (1 to `N`) of the current row. When the rows do not divide evenly, the first buckets get one row more. `N` is converted to an integer as in SQLite: a REAL is truncated (`ntile(2.5)` is `ntile(2)`), and text uses its leading digits (`ntile('2')` is `ntile(2)`). If the result is not positive, the query fails with `argument of ntile must be a positive integer`.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, team, points,
       row_number() OVER w AS row_number,
       rank() OVER w AS rank,
       dense_rank() OVER w AS dense_rank,
       percent_rank() OVER w AS percent_rank,
       cume_dist() OVER w AS cume_dist,
       ntile(2) OVER w AS ntile
FROM score
WINDOW w AS (PARTITION BY team ORDER BY points)
ORDER BY team, points, player;
```

| player | team | points | row_number | rank | dense_rank | percent_rank | cume_dist | ntile |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dan | blue | 5 | 1 | 1 | 1 | 0 | 0.5 | 1 |
| eve | blue | 15 | 2 | 2 | 2 | 1 | 1 | 2 |
| ann | red | 10 | 1 | 1 | 1 | 0 | 0.3333333333333333 | 1 |
| bob | red | 20 | 2 | 2 | 2 | 0.5 | 1 | 1 |
| cat | red | 20 | 3 | 2 | 2 | 0.5 | 1 | 2 |
