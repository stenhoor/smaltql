# date_trunc

```ebnf
date_trunc ::= 'date_trunc' '(' UNIT ',' X ')'
```

`X` cut to the start of its `UNIT`: `year`, `quarter`, `month`, `week` (to Monday), `day`, `hour`, `minute`,
`second`, `millisecond` or `microsecond`.

- **Returns:** a date for a `DATE` argument, else a date and time.
- **Errors:** `SMALT_MISMATCH` for another unit, naming the ones it takes.

```sql
SELECT date_trunc('month', '2026-11-07 10:30:00') AS month_start, date_trunc('quarter', '2026-11-08') AS quarter_start,
       date_trunc('week', '2026-11-08 10:00:00') AS week_start, date_trunc('month', DATE '2026-11-07') AS of_a_date;
```

| month_start | quarter_start | week_start | of_a_date |
| --- | --- | --- | --- |
| 2026-11-01 00:00:00 | 2026-10-01 00:00:00 | 2026-11-02 00:00:00 | 2026-11-01 |
