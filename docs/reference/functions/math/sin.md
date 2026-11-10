# sin

```ebnf
sin ::= 'sin' '(' X ')'
```

The sine of the angle `X`, in radians.

```sql
SELECT sin(0) AS a, round(sin(pi() / 6), 10) AS b, sin(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | 0.5 | NULL |

Related: [`cos`](./cos), [`tan`](./tan), [`asin`](./asin), [`acos`](./acos), [`atan`](./atan), [`atan2`](./atan2).
