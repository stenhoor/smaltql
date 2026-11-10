# microsecond

```ebnf
microsecond ::= 'microsecond' '(' X ')'
```

The fraction of a second of `X`, in microseconds, 0 to 999999.

`X` is a date and time, or a time (a `TIME '…'` literal).

```sql
SELECT microsecond('2026-11-08 14:30:15.250') AS a, microsecond(TIME '09:05:07') AS b, microsecond(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 250000 | 0 | NULL |

Related: [`hour`](./hour), [`minute`](./minute), [`second`](./second).
