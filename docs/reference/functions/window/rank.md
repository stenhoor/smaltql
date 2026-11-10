# rank

```ebnf
rank ::= 'rank' '(' ')' 'OVER' window-spec
```

The `row_number` of the first peer of the current row: ties share a rank, and a gap follows them.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points, rank() OVER (ORDER BY points DESC) AS rank FROM score ORDER BY points DESC, player;
```

| player | points | rank |
| --- | --- | --- |
| bob | 20 | 1 |
| cat | 20 | 1 |
| eve | 15 | 3 |
| ann | 10 | 4 |
| dan | 5 | 5 |
