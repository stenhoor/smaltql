# make_datetime, make_timestamp

```ebnf
make_datetime ::= ('make_datetime' | 'make_timestamp') '(' YEAR ',' MONTH ',' DAY (',' HOUR (',' MINUTE (',' SECOND (',' MICROSECOND)?)?)?)? ')'
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
