# hour

```ebnf
hour ::= 'hour' '(' X ')'
```

The hour of `X`, 0 to 23.

`X` is a date and time, or a time (a `TIME '…'` literal: text such as `'14:30'` is read as a date and fails to give one).

```sql
SELECT hour('2026-11-08 14:30:15') AS a, hour(TIME '09:05:00') AS b, hour(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 14 | 9 | NULL |

Related: [`minute`](./minute), [`second`](./second), [`microsecond`](./microsecond).
