# atan

```ebnf
atan ::= 'atan' '(' X ')'
```

The arctangent of `X`: the angle, in radians, whose tangent is `X`.

```sql
SELECT atan(0) AS a, degrees(atan(1)) AS b, atan(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 45 | NULL |

Related: [`sin`](./sin), [`cos`](./cos), [`tan`](./tan), [`asin`](./asin), [`acos`](./acos), [`atan2`](./atan2).
