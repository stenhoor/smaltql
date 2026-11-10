# sinh

```ebnf
sinh ::= 'sinh' '(' X ')'
```

The hyperbolic sine of `X`.

```sql
SELECT sinh(0) AS a, round(sinh(1), 10) AS b, sinh(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 1.1752011936 | NULL |

Related: [`cosh`](./cosh), [`tanh`](./tanh), [`asinh`](./asinh), [`acosh`](./acosh), [`atanh`](./atanh).
