# strftime

```ebnf
strftime ::= 'strftime' '(' FORMAT (',' TIME (',' MOD)*)? ')'
```

Formats the time with `FORMAT`, in which each `%` code below is replaced and every other character is copied. A NULL format gives NULL. An unknown code, such as `%Q`, makes the whole result NULL.

## Format codes {#format-codes}

Results below are for `'2024-03-05 08:04:09.125'`, a Tuesday.

| Code | Meaning | Example |
| --- | --- | --- |
| `%d` | Day of month, `01`–`31` | `05` |
| `%e` | Day of month, space-padded, ` 1`–`31` | ` 5` |
| `%f` | Seconds with milliseconds, `SS.SSS` | `09.125` |
| `%F` | ISO date, same as `%Y-%m-%d` | `2024-03-05` |
| `%G` | ISO 8601 week-based year | `2024` |
| `%g` | ISO 8601 week-based year, last two digits | `24` |
| `%H` | Hour, `00`–`23` | `08` |
| `%I` | Hour on a 12-hour clock, `01`–`12` | `08` |
| `%j` | Day of year, `001`–`366` | `065` |
| `%J` | Julian day number, with fraction | `2460374.836216724` |
| `%k` | Hour, space-padded, ` 0`–`23` | ` 8` |
| `%l` | Hour on a 12-hour clock, space-padded, ` 1`–`12` | ` 8` |
| `%m` | Month, `01`–`12` | `03` |
| `%M` | Minute, `00`–`59` | `04` |
| `%p` | `AM` or `PM` | `AM` |
| `%P` | `am` or `pm` | `am` |
| `%R` | Hour and minute, same as `%H:%M` | `08:04` |
| `%s` | Seconds since 1970-01-01 (with milliseconds when `subsec` is used) | `1709625849` |
| `%S` | Seconds, `00`–`59` | `09` |
| `%T` | Time, same as `%H:%M:%S` | `08:04:09` |
| `%u` | Day of week, `1`–`7`, Monday = 1 | `2` |
| `%U` | Week of year, `00`–`53`; week 1 starts on the first Sunday | `09` |
| `%V` | ISO 8601 week of year, `01`–`53` | `10` |
| `%w` | Day of week, `0`–`6`, Sunday = 0 | `2` |
| `%W` | Week of year, `00`–`53`; week 1 starts on the first Monday | `10` |
| `%Y` | Year, `0000`–`9999` | `2024` |
| `%%` | A literal `%` | `%` |

```sql
SELECT strftime('%d|%e|%f|%F|%G|%g|%H|%I|%j|%J|%k|%l|%m|%M|%p|%P|%R|%s|%S|%T|%u|%U|%V|%w|%W|%Y|%%', '2024-03-05 08:04:09.125') AS codes;
```

| codes |
| --- |
| 05\| 5\|09.125\|2024-03-05\|2024\|24\|08\|08\|065\|2460374.836216724\| 8\| 8\|03\|04\|AM\|am\|08:04\|1709625849\|09\|08:04:09\|2\|09\|10\|2\|10\|2024\|% |

```sql
SELECT strftime('%Y-%m', '2024-03-15') AS month,
       strftime('%H:%M', '2024-03-15 13:45:30', '+1 hour') AS hour_later,
       strftime('%I:%M %p', '2024-03-15 00:30') AS twelve_hour,
       strftime('%G-W%V-%u', '2021-01-01') AS iso_week,
       strftime('%s', '2024-03-05 08:04:09.125', 'subsec') AS epoch_ms,
       strftime('%Q', '2024-03-15') AS unknown_code;
```

| month | hour_later | twelve_hour | iso_week | epoch_ms | unknown_code |
| --- | --- | --- | --- | --- | --- |
| 2024-03 | 14:45 | 12:30 AM | 2020-W53-5 | 1709625849.125 | NULL |
