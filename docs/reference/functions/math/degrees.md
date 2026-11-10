# degrees

```ebnf
degrees ::= 'degrees' '(' X ')'
```

The angle `X`, in radians, in degrees.

```sql
SELECT degrees(pi()) AS a, round(degrees(1), 6) AS b, degrees(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 180 | 57.29578 | NULL |

Related: [`pi`](./pi), [`radians`](./radians).
