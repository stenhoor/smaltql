# minute

```ebnf
minute ::= 'minute' '(' X ')'
```

The minute of `X`, 0 to 59.

`X` is a date and time, or a time (a `TIME '…'` literal).

```sql
SELECT minute('2026-11-08 14:30:15') AS a, minute(TIME '09:05:00') AS b, minute(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 30 | 5 | NULL |

Related: [`hour`](./hour), [`second`](./second), [`microsecond`](./microsecond).
