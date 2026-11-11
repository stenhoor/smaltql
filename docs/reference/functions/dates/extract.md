# EXTRACT, date_part

```ebnf
extract ::= 'EXTRACT' '(' date-field 'FROM' X ')' | 'date_part' '(' FIELD ',' X ')'
```

The part of `X` that `FIELD` names, as an integer. `EXTRACT` takes the field as a word, `date_part` as text.

- **Fields:** `year`, `month`, `day`, `hour`, `minute`, `second`, `microsecond` (or `microseconds`), `isodow` (the
  ISO day of the week, Monday 1) and `doy` (the day of the year).
- **Errors:** `SMALT_ERROR` for another field, naming the ones it takes.

```sql
SELECT EXTRACT(month FROM '2026-11-08') AS m, date_part('isodow', '2026-11-08') AS dow,
       date_part('doy', '2026-11-08') AS doy, EXTRACT(second FROM '2026-11-08 10:00:05.5') AS s;
```

| m | dow | doy | s |
| --- | --- | --- | --- |
| 11 | 7 | 312 | 5 |
