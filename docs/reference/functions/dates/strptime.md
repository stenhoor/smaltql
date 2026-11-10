# strptime

```ebnf
strptime ::= 'strptime' '(' TEXT (',' FORMAT)? ')'
```

`TEXT` read as a date and time. Without `FORMAT`, `TEXT` is in the result form (`2026-11-07 10:30:00`, a `T` between
date and time, or a date alone). With `FORMAT`, it is read with [`strftime`'s codes](../datetime/#format-codes): `%Y`,
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
