# atan2

```ebnf
atan2 ::= 'atan2' '(' Y ',' X ')'
```

The angle of the point (`X`, `Y`) from the positive x-axis, in radians, from -π to π.

Unlike `atan(Y / X)`, it takes the signs of both into account, and works when `X` is 0.

```sql
SELECT degrees(atan2(1, 1)) AS a, degrees(atan2(-1, -1)) AS b, degrees(atan2(1, 0)) AS c, atan2(NULL, 1) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 45 | -135 | 90 | NULL |

Related: [`sin`](./sin), [`cos`](./cos), [`tan`](./tan), [`asin`](./asin), [`acos`](./acos), [`atan`](./atan).
