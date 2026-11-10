# year

```ebnf
year ::= 'year' '(' X ')'
```

The year of the date `X` (a date, or a date and time).

Text that is not a date gives NULL.

```sql
SELECT year('2026-11-08') AS a, year('2026-11-08 14:30:00') AS b, year('not a date') AS c, year(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 2026 | 2026 | NULL | NULL |

Related: [`month`](./month), [`day`](./day), [`weekday`](./weekday), [`day_of_year`](./day_of_year).
