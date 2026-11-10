# radians

```ebnf
radians ::= 'radians' '(' X ')'
```

The angle `X`, in degrees, in radians.

```sql
SELECT radians(180) AS a, radians(0) AS b, radians(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 3.141592653589793 | 0 | NULL |

Related: [`pi`](./pi), [`degrees`](./degrees).
