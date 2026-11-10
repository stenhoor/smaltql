# first_value

```ebnf
first_value ::= 'first_value' '(' X ')' (('IGNORE' | 'RESPECT') 'NULLS')? 'OVER' window-spec
```

`X` evaluated on the first row of the frame.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, team, points,
       first_value(player) OVER (PARTITION BY team ORDER BY points DESC, player) AS top
FROM score ORDER BY team, points DESC, player;
```

| player | team | points | top |
| --- | --- | --- | --- |
| eve | blue | 15 | eve |
| dan | blue | 5 | eve |
| bob | red | 20 | bob |
| cat | red | 20 | bob |
| ann | red | 10 | bob |
