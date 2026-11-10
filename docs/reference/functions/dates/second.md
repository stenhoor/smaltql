# second

```ebnf
second ::= 'second' '(' X ')'
```

The second of `X`, 0 to 59, without its fraction.

`X` is a date and time, or a time (a `TIME '…'` literal).

```sql
SELECT second('2026-11-08 14:30:15.250') AS a, second(TIME '09:05:07') AS b, second(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 15 | 7 | NULL |

Related: [`hour`](./hour), [`minute`](./minute), [`microsecond`](./microsecond).
