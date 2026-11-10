# acosh

```ebnf
acosh ::= 'acosh' '(' X ')'
```

The inverse hyperbolic cosine of `X`.

`X` below 1 gives NULL.

```sql
SELECT acosh(1) AS a, round(acosh(2), 10) AS b, acosh(0) AS c, acosh(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 0 | 1.3169578969 | NULL | NULL |

Related: [`sinh`](./sinh), [`cosh`](./cosh), [`tanh`](./tanh), [`asinh`](./asinh), [`atanh`](./atanh).
