# last_value

```ebnf
last_value ::= 'last_value' '(' X ')' (('IGNORE' | 'RESPECT') 'NULLS')? 'OVER' window-spec
```

`X` evaluated on the last row of the frame. With the default frame, that is the last peer of the current row, not the last row of the partition; add `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to get the partition's last row.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points,
       last_value(player) OVER (ORDER BY points, player) AS last_so_far,
       last_value(player) OVER (ORDER BY points, player ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last
FROM score ORDER BY points, player;
```

| player | points | last_so_far | last |
| --- | --- | --- | --- |
| dan | 5 | dan | cat |
| ann | 10 | ann | cat |
| eve | 15 | eve | cat |
| bob | 20 | bob | cat |
| cat | 20 | cat | cat |
