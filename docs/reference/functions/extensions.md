# smaltdb extensions

Functions SQLite doesn't have, which smaltql calls from smaltdb's engine ([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)). They read and give values as SQL holds them: dates and times as text, lists as JSON text. Other engine functions are not SQL: calling one fails with `no such function`.

## Dates and times {#dates}

`make_date(YEAR, MONTH, DAY)` builds a date, and `make_datetime(YEAR, MONTH, DAY [, HOUR [, MINUTE [, SECOND [, MICROSECOND]]]])` a date and time; the clock parts default to 0. A date that doesn't exist (`2025, 2, 29`) is an error (`SMALT_RANGE`).

```sql
SELECT make_date(2026, 11, 7) AS d, make_datetime(2026, 11, 7, 14, 30) AS ts;
```

| d | ts |
| --- | --- |
| 2026-11-07 | 2026-11-07 14:30:00 |

## Time zones {#zones}

A zone is an IANA name (`Europe/Paris`), `UTC` or an offset (`+05:30`), and may come from a column. A date and time carries no zone.

- `to_zone(TS, ZONE)`: the wall-clock time in `ZONE` of `TS`, a UTC instant.
- `from_zone(TS, ZONE [, HOW])`: the UTC instant of `TS`, a wall-clock time in `ZONE`. A time that occurs twice is the earlier unless `HOW` is `later`; one that doesn't occur moves forward by the gap (`earlier` moves it back; `reject` makes either an error).
- `zone_offset(TS, ZONE)`: the zone's offset from UTC at `TS`, as an ISO 8601 duration.

```sql
SELECT to_zone(make_datetime(2026, 7, 1, 12), 'Europe/Paris') AS paris,
       from_zone(make_datetime(2026, 7, 1, 14), 'Europe/Paris') AS utc,
       zone_offset(make_datetime(2026, 1, 1), 'America/New_York') AS "offset";
```

| paris | utc | offset |
| --- | --- | --- |
| 2026-07-01 14:00:00 | 2026-07-01 12:00:00 | -PT5H |

## Lists {#lists}

`list_sum`, `list_mean`, `list_min` and `list_max` reduce a list's non-NULL numbers: the sum (0 for none), the mean, the least and the greatest (NULL for none).

```sql
SELECT list_sum(list_of(1, 2, 3)) AS total, list_mean(list_of(1, 2, 3)) AS mean,
       list_min(list_of(3, 1, 2)) AS least, list_max(list_of(3, 1, 2)) AS greatest;
```

| total | mean | least | greatest |
| --- | --- | --- | --- |
| 6 | 2 | 1 | 3 |

## Text {#text}

`lower_unicode(X)` and `upper_unicode(X)` map the case of every script; `lower` and `upper` map ASCII letters only, as in SQLite.

```sql
SELECT lower('ÄBC') AS ascii, lower_unicode('ÄBC') AS "unicode", upper_unicode('straße') AS "upper";
```

| ascii | unicode | upper |
| --- | --- | --- |
| Äbc | äbc | STRASSE |

## First and last {#first-last}

The aggregates `first(X)` and `last(X)` give the value of a group's first or last row, in the order rows reach the aggregate. `first(X, KEY)` gives `X` at the row with the smallest `KEY`, and `last(X, KEY)` at the largest, skipping rows whose key is NULL. `arg_min(X, KEY)` and `arg_max(X, KEY)` are the same as `first(X, KEY)` and `last(X, KEY)`.

```sql
SELECT first(x) AS first_x, last(x) AS last_x, arg_min(x, k) AS x_at_least_k
FROM (SELECT 'a' AS x, 2 AS k UNION ALL SELECT 'b', 1 UNION ALL SELECT 'c', 3);
```

| first_x | last_x | x_at_least_k |
| --- | --- | --- |
| a | c | b |

## Rounding half to even {#round_even}

`round_even(X [, DIGITS])` rounds `X` to `DIGITS` places (default 0) with halves to the even digit, decided on the exact binary value. `round` rounds halves away from zero, as in SQLite.

```sql
SELECT round(2.5) AS "round", round_even(2.5) AS round_even, round_even(0.125, 2) AS two_places;
```

| round | round_even | two_places |
| --- | --- | --- |
| 3 | 2 | 0.12 |

## Regular expressions {#regexp}

Patterns are JavaScript regular expressions. `FLAGS` may hold `i` (ignore case), `m` and `s`; `regexp_replace` also takes `g`, to replace every match. The replacement may use `$1` and `$&`.

- `X REGEXP P`, `regexp_like(X, P [, FLAGS])`: 1 if `P` matches anywhere in `X`, else 0.
- `regexp_substr(X, P [, FLAGS])`: the first match, or NULL.
- `regexp_replace(X, P, R [, FLAGS])`: `X` with the first match, or with `g` every match, replaced by `R`.

```sql
SELECT 'abc' REGEXP 'b.' AS m, regexp_like('ABC', 'b', 'i') AS i,
       regexp_substr('x12y34', '[0-9]+') AS first, regexp_replace('a1b2', '[0-9]', '#', 'g') AS every;
```

| m | i | first | every |
| --- | --- | --- | --- |
| 1 | 1 | 12 | a#b# |

## NaN {#isnan}

`isnan(X)` is 1 when `X` is NaN, 0 otherwise, and NULL for NULL. SQL itself gives NULL where IEEE arithmetic gives NaN (`0.0 / 0.0`), but data another language stored can hold NaN, and SQL shows it as NaN.

## IGNORE NULLS {#ignore-nulls}

`IGNORE NULLS` before `OVER` makes `lag`, `lead`, `first_value`, `last_value` and `nth_value` skip rows whose value is NULL. See [window functions](./window#navigation-functions).

```sql
SELECT i, lag(x) IGNORE NULLS OVER (ORDER BY i) AS prev
FROM (SELECT 1 AS i, 10 AS x UNION ALL SELECT 2, NULL UNION ALL SELECT 3, 30)
ORDER BY i;
```

| i | prev |
| --- | --- |
| 1 | NULL |
| 2 | 10 |
| 3 | 10 |
