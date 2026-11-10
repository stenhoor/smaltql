# cume_dist

```ebnf
cume_dist ::= 'cume_dist' '(' ')' 'OVER' window-spec
```

The number of rows up to and including the current row's last peer, divided by the number of rows in the partition.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points, cume_dist() OVER (ORDER BY points) AS cume_dist FROM score ORDER BY points, player;
```

| player | points | cume_dist |
| --- | --- | --- |
| dan | 5 | 0.2 |
| ann | 10 | 0.4 |
| eve | 15 | 0.6 |
| bob | 20 | 1 |
| cat | 20 | 1 |
