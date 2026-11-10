# percent_rank

```ebnf
percent_rank ::= 'percent_rank' '(' ')' 'OVER' window-spec
```

`(rank - 1) / (rows in partition - 1)`, a REAL from 0 to 1. A partition of one row gives 0.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points, percent_rank() OVER (ORDER BY points) AS percent_rank FROM score ORDER BY points, player;
```

| player | points | percent_rank |
| --- | --- | --- |
| dan | 5 | 0 |
| ann | 10 | 0.25 |
| eve | 15 | 0.5 |
| bob | 20 | 0.75 |
| cat | 20 | 0.75 |
