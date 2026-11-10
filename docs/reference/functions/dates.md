# Dates, times and zones

Functions for building dates, taking them apart, moving them, and converting between time zones. They are smaltdb
extensions, beside SQLite's [date and time functions](./datetime): SQLite has none of them
([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

| Function | Result |
| --- | --- |
| [`make_date(Y, M, D)`](#make_date) | A date |
| [`make_datetime(Y, M, D, …)`, `make_timestamp(…)`](#make_datetime) | A date and time |
| [`year`, `month`, `day`, `weekday`, `day_of_year`](#year) | A part of a date |
| [`hour`, `minute`, `second`, `microsecond`](#hour) | A part of a time |
| [`EXTRACT(FIELD FROM X)`, `date_part('FIELD', X)`](#extract) | Any part, by name |
| [`date_trunc('UNIT', X)`](#date_trunc) | `X` cut to the start of a unit |
| [`strptime(TEXT [, FORMAT])`](#strptime) | Text read as a date and time |
| [`offset_by(X, OFFSET)`](#offset_by) | `X` moved by an offset |
| [`now()`](#now) | The current date and time |
| [`DATE '…'`, `TIME '…'`, `TIMESTAMP '…'`](#literals) | Typed literals |
| [`X + INTERVAL '…'`, `X - INTERVAL '…'`](#interval) | `X` moved by an interval |
| [`to_zone`, `from_zone`, `zone_offset`](#to_zone) | Time zones |

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

## make_date {#make_date}

```
make_date(YEAR, MONTH, DAY)
```

The date with that year, month and day.

- **Arguments:** three integers.
- **Returns:** a date, as `YYYY-MM-DD`.
- **Errors:** `SMALT_RANGE` for a date that doesn't exist (`2025, 2, 29`); `SMALT_MISMATCH` for an argument that
  isn't an integer.

```sql play
SELECT make_date(2026, 11, 7) AS d, make_date(2024, 2, 29) AS leap_day, make_date(NULL, 1, 1) AS null_year;
```

| d | leap_day | null_year |
| --- | --- | --- |
| 2026-11-07 | 2024-02-29 | NULL |

<!-- docs:error SMALT_RANGE -->
```sql
SELECT make_date(2025, 2, 29);
```

## make_datetime, make_timestamp {#make_datetime}

```
make_datetime(YEAR, MONTH, DAY [, HOUR [, MINUTE [, SECOND [, MICROSECOND]]]])
make_timestamp(…)
```

The date and time with those parts. The clock parts default to 0. `make_timestamp` is the same function.

- **Returns:** a date and time, as `YYYY-MM-DD HH:MM:SS`, with the fraction of a second when there is one.
- **Errors:** `SMALT_RANGE` for a date or time of day that doesn't exist (an hour of 25).

```sql
SELECT make_datetime(2026, 11, 7) AS midnight, make_datetime(2026, 11, 7, 14, 30) AS afternoon,
       make_timestamp(2026, 11, 7, 14, 30, 15, 500) AS with_microseconds;
```

| midnight | afternoon | with_microseconds |
| --- | --- | --- |
| 2026-11-07 00:00:00 | 2026-11-07 14:30:00 | 2026-11-07 14:30:15.000500 |

<!-- docs:error SMALT_RANGE -->
```sql
SELECT make_datetime(2026, 11, 7, 25, 0);
```

## year, month, day, weekday, day_of_year {#year}

```
year(X)
month(X)
day(X)
weekday(X)
day_of_year(X)
```

A part of the date `X` (a date, or a date and time), as an integer: the year; the month, 1 to 12; the day of the
month; the ISO day of the week, Monday 1 to Sunday 7; and the day of the year, 1 to 366.

```sql
SELECT year('2026-11-08') AS y, month('2026-11-08') AS m, day('2026-11-08') AS d,
       weekday('2026-11-08') AS sunday, weekday('2026-11-09') AS monday, day_of_year('2026-11-08') AS doy,
       year('not a date') AS not_a_date;
```

| y | m | d | sunday | monday | doy | not_a_date |
| --- | --- | --- | --- | --- | --- | --- |
| 2026 | 11 | 8 | 7 | 1 | 312 | NULL |

## hour, minute, second, microsecond {#hour}

```
hour(X)
minute(X)
second(X)
microsecond(X)
```

A part of the clock of `X` (a date and time, or a `TIME`), as an integer: the hour, 0 to 23; the minute; the whole
second; and the microseconds within the second, 0 to 999999. A date alone is midnight.

```sql
SELECT hour('2026-11-07 14:30:45.25') AS h, minute('2026-11-07 14:30:45.25') AS mi,
       second('2026-11-07 14:30:45.25') AS s, microsecond('2026-11-07 14:30:45.25') AS us,
       hour(TIME '09:15:00') AS from_time, hour('2026-11-07') AS from_date;
```

| h | mi | s | us | from_time | from_date |
| --- | --- | --- | --- | --- | --- |
| 14 | 30 | 45 | 250000 | 9 | 0 |

## EXTRACT, date_part {#extract}

```
EXTRACT(FIELD FROM X)
date_part('FIELD', X)
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

<!-- docs:error SMALT_ERROR -->
```sql
SELECT date_part('quarter', '2026-11-08');
```

## date_trunc {#date_trunc}

```
date_trunc('UNIT', X)
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

## strptime {#strptime}

```
strptime(TEXT [, FORMAT])
```

`TEXT` read as a date and time. Without `FORMAT`, `TEXT` is in the result form (`2026-11-07 10:30:00`, a `T` between
date and time, or a date alone). With `FORMAT`, it is read with [`strftime`'s codes](./datetime#format-codes): `%Y`,
`%m`, `%d`, `%H`, `%I` with `%p`, `%M`, `%S`, `%f`, `%b` (month names) and the others. A missing month or day is 1, and
a missing clock is midnight.

- **Returns:** a date and time, or NULL when `TEXT` doesn't match.
- **Errors:** `SMALT_MISMATCH` for a format without a year.

```sql
SELECT strptime('07/11/2026', '%d/%m/%Y') AS day_first, strptime('07 Nov 2026 2:30 PM', '%d %b %Y %I:%M %p') AS words,
       strptime('2026-11-07T10:30:00') AS iso, strptime('2026', '%Y') AS year_only, strptime('nope', '%Y') AS no_match;
```

| day_first | words | iso | year_only | no_match |
| --- | --- | --- | --- | --- |
| 2026-11-07 00:00:00 | 2026-11-07 14:30:00 | 2026-11-07 10:30:00 | 2026-01-01 00:00:00 | NULL |

## offset_by {#offset_by}

```
offset_by(X, OFFSET)
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

<!-- docs:error SMALT_MISMATCH -->
```sql
SELECT offset_by('2026-11-07', 'soon');
```

## now {#now}

```
now()
```

The current date and time, in UTC: the same as [`CURRENT_TIMESTAMP`](./datetime#current_date), read once per statement.

```sql
SELECT now() = CURRENT_TIMESTAMP AS same;
```

| same |
| --- |
| 1 |

## DATE, TIME, TIMESTAMP literals {#literals}

```
DATE 'YYYY-MM-DD'
TIME 'HH:MM:SS[.fraction]'
TIMESTAMP 'YYYY-MM-DD HH:MM:SS[.fraction]'
```

A date, a time of day, or a date and time, written as text after its type's name. They read as their text, and they
tell the functions on this page what kind of value they are.

- **Errors:** `SMALT_MISMATCH` when the text isn't that kind of value, so the statement fails rather than giving NULL.

```sql
SELECT DATE '2026-11-07' AS d, TIME '12:30:00' AS t, TIMESTAMP '2026-11-07 12:30:00.5' AS ts;
```

| d | t | ts |
| --- | --- | --- |
| 2026-11-07 | 12:30:00 | 2026-11-07 12:30:00.500 |

<!-- docs:error SMALT_MISMATCH -->
```sql
SELECT DATE '2026-13-01';
```

## INTERVAL {#interval}

```
X + INTERVAL 'N UNIT [N UNIT …]'
X - INTERVAL 'N UNIT [N UNIT …]'
```

`X` (a date, or a date and time) moved by an interval: numbers with units, `year`, `quarter`, `month`, `week`, `day`,
`hour`, `minute`, `second`, `millisecond` or `microsecond` (singular or plural). It moves as
[`offset_by`](#offset_by) does: months on the calendar, then days and the clock.

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

<!-- docs:error SMALT_ERROR -->
```sql
SELECT INTERVAL '1 day';
```

## to_zone, from_zone, zone_offset {#to_zone}

```
to_zone(TS, ZONE)
from_zone(TS, ZONE [, HOW])
zone_offset(TS, ZONE)
```

A date and time carries no zone: whether it is a UTC instant or a wall-clock time is what the data means. These
functions convert between the two. `ZONE` is an IANA name (`Europe/Paris`), `UTC`, or an offset (`+05:30`), and may
come from a column.

- **`to_zone(TS, ZONE)`:** the wall-clock time in `ZONE` at `TS`, a UTC instant.
- **`from_zone(TS, ZONE [, HOW])`:** the UTC instant of `TS`, a wall-clock time in `ZONE`. When clocks go back, a time
  that occurs twice is the earlier instant, or with `HOW` `'later'`, the later. When clocks go forward, a time that
  doesn't occur moves forward by the gap, or with `'earlier'`, back. With `'reject'`, either fails (`SMALT_RANGE`).
  The default is `'compatible'`.
- **`zone_offset(TS, ZONE)`:** the zone's offset from UTC at the instant `TS`, as an ISO 8601 duration (`PT2H`).
- **Errors:** `SMALT_MISMATCH` for a zone it doesn't know, for a `HOW` other than those above, or for a date without a
  time.

```sql
SELECT to_zone('2026-07-01 12:00:00', 'Europe/Paris') AS paris, to_zone('2026-07-01 12:00:00', '+05:30') AS fixed,
       from_zone('2026-07-01 14:00:00', 'Europe/Paris') AS utc, zone_offset('2026-01-01 00:00:00', 'America/New_York') AS winter,
       zone_offset('2026-07-01 00:00:00', 'Asia/Kolkata') AS ist;
```

| paris | fixed | utc | winter | ist |
| --- | --- | --- | --- | --- |
| 2026-07-01 14:00:00 | 2026-07-01 17:30:00 | 2026-07-01 12:00:00 | -PT5H | PT5H30M |

Clocks in New York went forward at 2:00 on 8 March 2026, and back at 2:00 on 1 November:

```sql
SELECT from_zone('2026-03-08 02:30:00', 'America/New_York') AS gap_forward,
       from_zone('2026-03-08 02:30:00', 'America/New_York', 'earlier') AS gap_back,
       from_zone('2026-11-01 01:30:00', 'America/New_York') AS twice_earlier,
       from_zone('2026-11-01 01:30:00', 'America/New_York', 'later') AS twice_later;
```

| gap_forward | gap_back | twice_earlier | twice_later |
| --- | --- | --- | --- |
| 2026-03-08 07:30:00 | 2026-03-08 06:30:00 | 2026-11-01 05:30:00 | 2026-11-01 06:30:00 |

<!-- docs:error SMALT_MISMATCH -->
```sql
SELECT to_zone('2026-07-01 12:00:00', 'Mars/Base');
```

See also: [SQLite's date and time functions](./datetime), [types](../sql/types), [smaltdb extensions](./extensions).
