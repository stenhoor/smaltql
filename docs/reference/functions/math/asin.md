# asin

```ebnf
asin ::= 'asin' '(' X ')'
```

The arcsine of `X`: the angle, in radians, whose sine is `X`.

`X` outside -1 to 1 gives NULL.

```sql
SELECT asin(0) AS a, degrees(asin(1)) AS b, asin(2) AS c, asin(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 0 | 90 | NULL | NULL |

Related: [`sin`](./sin), [`cos`](./cos), [`tan`](./tan), [`acos`](./acos), [`atan`](./atan), [`atan2`](./atan2).
