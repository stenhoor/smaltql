# cos

```ebnf
cos ::= 'cos' '(' X ')'
```

The cosine of the angle `X`, in radians.

```sql
SELECT cos(0) AS a, round(cos(pi() / 3), 10) AS b, cos(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | 0.5 | NULL |

Related: [`sin`](./sin), [`tan`](./tan), [`asin`](./asin), [`acos`](./acos), [`atan`](./atan), [`atan2`](./atan2).
