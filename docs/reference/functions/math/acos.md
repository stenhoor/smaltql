# acos

```ebnf
acos ::= 'acos' '(' X ')'
```

The arccosine of `X`: the angle, in radians, whose cosine is `X`.

`X` outside -1 to 1 gives NULL.

```sql
SELECT acos(1) AS a, degrees(acos(0)) AS b, acos(2) AS c, acos(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 0 | 90 | NULL | NULL |

Related: [`sin`](./sin), [`cos`](./cos), [`tan`](./tan), [`asin`](./asin), [`atan`](./atan), [`atan2`](./atan2).
