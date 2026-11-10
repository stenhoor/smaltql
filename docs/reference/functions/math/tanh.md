# tanh

```ebnf
tanh ::= 'tanh' '(' X ')'
```

The hyperbolic tangent of `X`.

```sql
SELECT tanh(0) AS a, round(tanh(1), 10) AS b, tanh(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 0.761594156 | NULL |

Related: [`sinh`](./sinh), [`cosh`](./cosh), [`asinh`](./asinh), [`acosh`](./acosh), [`atanh`](./atanh).
