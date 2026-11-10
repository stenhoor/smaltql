# weekday

```ebnf
weekday ::= 'weekday' '(' X ')'
```

The ISO day of the week of the date `X`: Monday is 1, Sunday is 7.

Text that is not a date gives NULL.

```sql
SELECT weekday('2026-11-08') AS sunday, weekday('2026-11-09') AS monday, weekday(NULL) AS n;
```

| sunday | monday | n |
| --- | --- | --- |
| 7 | 1 | NULL |

Related: [`year`](./year), [`month`](./month), [`day`](./day), [`day_of_year`](./day_of_year).
