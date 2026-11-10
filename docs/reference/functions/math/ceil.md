# ceil

```ebnf
ceil ::= 'ceil' '(' X ')' | 'ceiling' '(' X ')'
```

The smallest integer not less than `X`. `ceiling` is the same function.

```sql
SELECT ceil(1.2) AS a, ceil(-1.2) AS b, ceiling(5) AS c, ceil(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 2 | -1 | 5 | NULL |

Related: [`floor`](./floor), [`trunc`](./trunc).
