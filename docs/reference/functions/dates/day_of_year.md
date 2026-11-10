# day_of_year

```ebnf
day_of_year ::= 'day_of_year' '(' X ')'
```

The day of the year of the date `X`, 1 to 366.

Text that is not a date gives NULL.

```sql
SELECT day_of_year('2026-01-01') AS a, day_of_year('2026-11-08') AS b, day_of_year('2024-12-31') AS leap, day_of_year(NULL) AS n;
```

| a | b | leap | n |
| --- | --- | --- | --- |
| 1 | 312 | 366 | NULL |

Related: [`year`](./year), [`month`](./month), [`day`](./day), [`weekday`](./weekday).
