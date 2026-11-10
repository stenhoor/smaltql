# atanh

```ebnf
atanh ::= 'atanh' '(' X ')'
```

The inverse hyperbolic tangent of `X`.

`X` outside -1 to 1 gives NULL; 1 and -1 give `Infinity` and `-Infinity`.

```sql
SELECT atanh(0) AS a, round(atanh(0.5), 10) AS b, atanh(1) AS c, atanh(2) AS d, atanh(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| 0 | 0.5493061443 | Infinity | NULL | NULL |

Related: [`sinh`](./sinh), [`cosh`](./cosh), [`tanh`](./tanh), [`asinh`](./asinh), [`acosh`](./acosh).
