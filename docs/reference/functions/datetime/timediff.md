# timediff

```ebnf
timediff ::= 'timediff' '(' A ',' B ')'
```

The time from `B` to `A`, as text in the form `±YYYY-MM-DD HH:MM:SS.SSS`: a sign, then whole years, months and days, then the remaining time. Months are calendar months counted from `B`, so the result can be added to `B` as a [modifier](./#modifiers) to get `A`. Both arguments are time values; modifiers are not accepted. If either is NULL or invalid, the result is NULL.

```sql
SELECT timediff('2024-03-15', '2024-01-01') AS a,
       timediff('2024-01-01', '2024-03-15') AS b,
       timediff('2024-03-15 12:00:00.5', '2024-03-15 10:00') AS c,
       timediff('2025-03-01', '2024-02-29') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| +0000-02-14 00:00:00.000 | -0000-02-14 00:00:00.000 | +0000-00-00 02:00:00.500 | +0001-00-00 00:00:00.000 |

```sql
SELECT datetime('2024-01-01', timediff('2024-03-15 08:30', '2024-01-01')) AS round_trip;
```

| round_trip |
| --- |
| 2024-03-15 08:30:00 |
