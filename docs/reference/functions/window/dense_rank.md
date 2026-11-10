# dense_rank

```ebnf
dense_rank ::= 'dense_rank' '(' ')' 'OVER' window-spec
```

The number of the current row's peer group, starting at 1: ties share a rank, and there are no gaps.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points, dense_rank() OVER (ORDER BY points DESC) AS dense_rank FROM score ORDER BY points DESC, player;
```

| player | points | dense_rank |
| --- | --- | --- |
| bob | 20 | 1 |
| cat | 20 | 1 |
| eve | 15 | 2 |
| ann | 10 | 3 |
| dan | 5 | 4 |
