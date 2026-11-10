# asinh

```ebnf
asinh ::= 'asinh' '(' X ')'
```

The inverse hyperbolic sine of `X`.

```sql
SELECT asinh(0) AS a, round(asinh(1), 10) AS b, asinh(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 0.881373587 | NULL |

Related: [`sinh`](./sinh), [`cosh`](./cosh), [`tanh`](./tanh), [`acosh`](./acosh), [`atanh`](./atanh).
