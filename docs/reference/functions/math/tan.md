# tan

```ebnf
tan ::= 'tan' '(' X ')'
```

The tangent of the angle `X`, in radians.

```sql
SELECT tan(0) AS a, round(tan(pi() / 4), 10) AS b, tan(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 1 | NULL |

Related: [`sin`](./sin), [`cos`](./cos), [`asin`](./asin), [`acos`](./acos), [`atan`](./atan), [`atan2`](./atan2).
