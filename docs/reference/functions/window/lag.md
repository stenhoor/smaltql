# lag

```ebnf
lag ::= 'lag' '(' X (',' OFFSET (',' DEFAULT)?)? ')' (('IGNORE' | 'RESPECT') 'NULLS')? 'OVER' window-spec
```

`X` evaluated on the row `OFFSET` rows before the current one in the partition (default 1). If there is no such row, the result is `DEFAULT` (default NULL). A negative `OFFSET` looks forward; a NULL `OFFSET` gives NULL. `lag` ignores the frame.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points,
       lag(points) OVER (ORDER BY points, player) AS prev,
       lag(points, 2) OVER (ORDER BY points, player) AS prev2,
       lag(points, 1, 0) OVER (ORDER BY points, player) AS prev_or_0,
       points - lag(points) OVER (ORDER BY points, player) AS gain
FROM score ORDER BY points, player;
```

| player | points | prev | prev2 | prev_or_0 | gain |
| --- | --- | --- | --- | --- | --- |
| dan | 5 | NULL | NULL | 0 | NULL |
| ann | 10 | 5 | NULL | 5 | 5 |
| eve | 15 | 10 | 5 | 10 | 5 |
| bob | 20 | 15 | 10 | 15 | 5 |
| cat | 20 | 20 | 15 | 20 | 0 |
