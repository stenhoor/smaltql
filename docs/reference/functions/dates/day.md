# day

```ebnf
day ::= 'day' '(' X ')'
```

The day of the month of the date `X`, 1 to 31.

Text that is not a date gives NULL.

```sql
SELECT day('2026-11-08') AS a, day('2024-02-29') AS b, day(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 8 | 29 | NULL |

Related: [`year`](./year), [`month`](./month), [`weekday`](./weekday), [`day_of_year`](./day_of_year).
