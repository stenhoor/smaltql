# month

```ebnf
month ::= 'month' '(' X ')'
```

The month of the date `X`, 1 to 12.

Text that is not a date gives NULL.

```sql
SELECT month('2026-11-08') AS a, month('2026-01-31 23:59:59') AS b, month(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 11 | 1 | NULL |

Related: [`year`](./year), [`day`](./day), [`weekday`](./weekday), [`day_of_year`](./day_of_year).
