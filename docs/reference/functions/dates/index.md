# Dates, times and zones

Functions for building dates, taking them apart, moving them, and converting between time zones. They are smaltdb
extensions, beside SQLite's [date and time functions](../datetime/): SQLite has none of them
([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

## Functions {#functions}

- [`make_date`](./make_date): The date with that year, month and day.
- [`make_datetime`](./make_datetime): The date and time with those parts.
- [`year`](./year): The year of the date `X` (a date, or a date and time).
- [`month`](./month): The month of the date `X`, 1 to 12.
- [`day`](./day): The day of the month of the date `X`, 1 to 31.
- [`weekday`](./weekday): The ISO day of the week of the date `X`: Monday is 1, Sunday is 7.
- [`day_of_year`](./day_of_year): The day of the year of the date `X`, 1 to 366.
- [`hour`](./hour): The hour of `X`, 0 to 23.
- [`minute`](./minute): The minute of `X`, 0 to 59.
- [`second`](./second): The second of `X`, 0 to 59, without its fraction.
- [`microsecond`](./microsecond): The fraction of a second of `X`, in microseconds, 0 to 999999.
- [`extract`](./extract): The part of `X` that `FIELD` names, as an integer.
- [`date_trunc`](./date_trunc): `X` cut to the start of its `UNIT`, such as `month`, `week` (to Monday) or `hour`.
- [`strptime`](./strptime): `TEXT` read as a date and time.
- [`offset_by`](./offset_by): `X` moved by an offset written as text, such as `1mo`, `-2d` or `3h30m`.
- [`now`](./now): The current date and time, in UTC: the same as [`CURRENT_TIMESTAMP`](../datetime/current_timestamp), read once per statement.
- [`DATE`, `TIME` and `TIMESTAMP` literals](./typed-literals): A date, a time of day, or a date and time, written as text after its type's name.
- [`INTERVAL`](./interval): Added to or subtracted from a date or time to move it, such as `INTERVAL '1 hour 30 minutes'`.
- [`to_zone`](./to_zone): The wall-clock time in the time zone `ZONE` of the UTC date and time `TS`.
- [`from_zone`](./from_zone): The UTC date and time of the wall-clock time `TS` in the time zone `ZONE`.
- [`zone_offset`](./zone_offset): The offset from UTC of the time zone `ZONE` at the UTC date and time `TS`.

## Rules for every function on this page {#rules}

- **Values as SQL holds them:** results are text, as SQLite's date functions give: `2026-11-07` for a date,
  `2026-11-07 14:30:00` for a date and time (with `.250` or `.000500` when there are fractions of a second), and
  `14:30:00` for a time.
- **Arguments:** a date or a date and time may be text in that form, a typed literal (`DATE '2026-11-07'`), or another
  of these functions' results. A time of day needs a `TIME '…'` literal: text such as `'14:30:00'` alone isn't read as
  a time.
- **NULL:** a NULL argument gives NULL, and so does text that isn't a date where a function reads one.
- **Errors:** a date or time that doesn't exist fails with `SMALT_RANGE`; an argument of the wrong kind, or a name
  (a field, unit, zone or offset) the function doesn't know, fails with `SMALT_MISMATCH` or `SMALT_ERROR`, and the
  message lists what it takes.
