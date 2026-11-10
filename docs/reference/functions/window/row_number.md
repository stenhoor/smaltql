# row_number

```ebnf
row_number ::= 'row_number' '(' ')' 'OVER' window-spec
```

The number of the row within its partition, starting at 1. Peers get different numbers in an unspecified order.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points, row_number() OVER (ORDER BY points DESC, player) AS n,
       row_number() OVER (PARTITION BY team ORDER BY points DESC, player) AS in_team
FROM score ORDER BY n;
```

| player | points | n | in_team |
| --- | --- | --- | --- |
| bob | 20 | 1 | 1 |
| cat | 20 | 2 | 2 |
| eve | 15 | 3 | 1 |
| ann | 10 | 4 | 3 |
| dan | 5 | 5 | 2 |
