# time

```ebnf
time ::= 'time' '(' (TIME (',' MOD)*)? ')'
```

The time of day as `HH:MM:SS` text, or `HH:MM:SS.SSS` with `subsec`.

```sql
SELECT time('2024-03-15 13:45:30') AS a, time('13:45', '+30 minutes') AS b, time('10:00', '+15:30') AS c;
```

| a | b | c |
| --- | --- | --- |
| 13:45:30 | 14:15:00 | 01:30:00 |
