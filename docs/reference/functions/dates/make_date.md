# make_date

```ebnf
make_date ::= 'make_date' '(' YEAR ',' MONTH ',' DAY ')'
```

The date with that year, month and day.

- **Arguments:** three integers.
- **Returns:** a date, as `YYYY-MM-DD`.
- **Errors:** `SMALT_RANGE` for a date that doesn't exist (`2025, 2, 29`); `SMALT_MISMATCH` for an argument that
  isn't an integer.

```sql
SELECT make_date(2026, 11, 7) AS d, make_date(2024, 2, 29) AS leap_day, make_date(NULL, 1, 1) AS null_year;
```

| d | leap_day | null_year |
| --- | --- | --- |
| 2026-11-07 | 2024-02-29 | NULL |
