# datetime

```ebnf
datetime ::= 'datetime' '(' (TIME (',' MOD)*)? ')'
```

The date and time as `YYYY-MM-DD HH:MM:SS` text, or `YYYY-MM-DD HH:MM:SS.SSS` with `subsec`. This is the format to store timestamps in: it sorts and compares correctly as text.

```sql
SELECT datetime('2024-03-15T13:45:30Z') AS a, datetime('2024-03-15', '+30 seconds') AS b, datetime('2024-03-15 13:45:30', 'start of day', '+1 day', '-1 second') AS end_of_day;
```

| a | b | end_of_day |
| --- | --- | --- |
| 2024-03-15 13:45:30 | 2024-03-15 00:00:30 | 2024-03-15 23:59:59 |
