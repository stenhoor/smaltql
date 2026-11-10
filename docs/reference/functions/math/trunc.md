# trunc

```ebnf
trunc ::= 'trunc' '(' X ')'
```

`X` with its fractional part dropped, rounding toward zero.

```sql
SELECT trunc(1.8) AS a, trunc(-1.8) AS b, trunc(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | -1 | NULL |

Related: [`ceil`](./ceil), [`floor`](./floor).
