# floor

```ebnf
floor ::= 'floor' '(' X ')'
```

The largest integer not greater than `X`.

```sql
SELECT floor(1.8) AS a, floor(-1.2) AS b, floor(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | -2 | NULL |

Related: [`ceil`](./ceil), [`trunc`](./trunc).
