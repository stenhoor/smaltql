# cosh

```ebnf
cosh ::= 'cosh' '(' X ')'
```

The hyperbolic cosine of `X`.

```sql
SELECT cosh(0) AS a, round(cosh(1), 10) AS b, cosh(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | 1.5430806348 | NULL |

Related: [`sinh`](./sinh), [`tanh`](./tanh), [`asinh`](./asinh), [`acosh`](./acosh), [`atanh`](./atanh).
