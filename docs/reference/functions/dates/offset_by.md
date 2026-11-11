# offset_by

```ebnf
offset_by ::= 'offset_by' '(' X ',' OFFSET ')'
```

`X` (a date, or a date and time) moved by `OFFSET`, text such as `1mo`, `-2d` or `3h30m`: a number and a unit, `y`
(years), `q` (quarters), `mo` (months), `w`, `d`, `h`, `m` (minutes), `s`, `ms` or `us`, as many as needed. A leading
`-` moves back by all of it. Months move on the calendar and keep the day of the month, or take the last day of a
shorter month; then days and the clock.

- **Returns:** a date for a `DATE`, which moves by whole days only; else a date and time.
- **Errors:** `SMALT_MISMATCH` for an offset it can't read, or for a `DATE` moved by part of a day.

```sql
SELECT offset_by('2026-01-31', '1mo') AS month_end, offset_by('2026-11-07 10:00:00', '1y3mo') AS later,
       offset_by('2026-11-07 10:00:00', '-1d2h') AS earlier, offset_by(DATE '2026-11-07', '1w') AS a_date;
```

| month_end | later | earlier | a_date |
| --- | --- | --- | --- |
| 2026-02-28 00:00:00 | 2028-02-07 10:00:00 | 2026-11-06 08:00:00 | 2026-11-14 |
