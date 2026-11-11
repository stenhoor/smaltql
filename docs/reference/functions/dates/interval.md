# INTERVAL

```ebnf
interval ::= X ('+' | '-') 'INTERVAL' string-literal
```

`X` (a date, or a date and time) moved by an interval: numbers with units, `year`, `quarter`, `month`, `week`, `day`,
`hour`, `minute`, `second`, `millisecond` or `microsecond` (singular or plural). It moves as
[`offset_by`](./offset_by) does: months on the calendar, then days and the clock.

- **Returns:** a date for a `DATE`, which moves by whole days only; else a date and time.
- **Errors:** an `INTERVAL` can only be added to or subtracted from a date or a date and time. On its own, with text
  it can't read, or with parts of both signs (`'1 hour -30 minutes'`), it fails with `SMALT_ERROR`; with a `TIME`,
  with `SMALT_MISMATCH`.

```sql
SELECT DATE '2026-01-31' + INTERVAL '1 month' AS next_month, DATE '2026-03-31' - INTERVAL '1 month' AS month_before,
       TIMESTAMP '2026-11-07 10:00:00' + INTERVAL '1 hour 30 minutes' AS later,
       TIMESTAMP '2026-11-07 10:00:00' - INTERVAL '1 hour 30 minutes' AS earlier,
       DATE '2026-11-07' + INTERVAL '2 weeks' AS fortnight;
```

| next_month | month_before | later | earlier | fortnight |
| --- | --- | --- | --- | --- |
| 2026-02-28 | 2026-02-28 | 2026-11-07 11:30:00 | 2026-11-07 08:30:00 | 2026-11-21 |

A date plus a number keeps SQLite's meaning (`'2026-11-07' + 1` is `2027`): add `INTERVAL '1 day'` to move by days.
