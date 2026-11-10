# nth_value

```ebnf
nth_value ::= 'nth_value' '(' X ',' N ')' (('IGNORE' | 'RESPECT') 'NULLS')? 'OVER' window-spec
```

`X` evaluated on the `N`-th row of the frame (counting from 1), or NULL if the frame has fewer rows. `N` must be a positive integer, or the query fails with `second argument to nth_value must be a positive integer`.

The examples on this page use this table:

```sql
CREATE TABLE score(player TEXT, team TEXT, points INT);
INSERT INTO score VALUES
  ('ann', 'red', 10), ('bob', 'red', 20), ('cat', 'red', 20),
  ('dan', 'blue', 5), ('eve', 'blue', 15);
```

```sql
SELECT player, points,
       first_value(player) OVER (ORDER BY points, player) AS first,
       last_value(player) OVER (ORDER BY points, player) AS last_so_far,
       last_value(player) OVER (ORDER BY points, player ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last,
       nth_value(player, 2) OVER (ORDER BY points, player) AS second
FROM score
ORDER BY points, player;
```

| player | points | first | last_so_far | last | second |
| --- | --- | --- | --- | --- | --- |
| dan | 5 | dan | dan | cat | NULL |
| ann | 10 | dan | ann | cat | ann |
| eve | 15 | dan | eve | cat | ann |
| bob | 20 | dan | bob | cat | ann |
| cat | 20 | dan | cat | cat | ann |
