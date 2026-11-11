# lead

```ebnf
lead ::= 'lead' '(' X (',' OFFSET (',' DEFAULT)?)? ')' (('IGNORE' | 'RESPECT') 'NULLS')? 'OVER' window-spec
```

Like [`lag`](./lag), but looks `OFFSET` rows after the current one.

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
       lead(points, 2) OVER (ORDER BY points, player) AS next2,
       lag(points, 1, 0) OVER (ORDER BY points, player) AS prev_or_0,
       points - lag(points) OVER (ORDER BY points, player) AS gain
FROM score
ORDER BY points, player;
```

| player | points | prev | next2 | prev_or_0 | gain |
| --- | --- | --- | --- | --- | --- |
| dan | 5 | NULL | 15 | 0 | NULL |
| ann | 10 | 5 | 20 | 5 | 5 |
| eve | 15 | 10 | 20 | 10 | 5 |
| bob | 20 | 15 | NULL | 15 | 5 |
| cat | 20 | 20 | NULL | 20 | 0 |
