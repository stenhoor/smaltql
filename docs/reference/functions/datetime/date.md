# date

```ebnf
date ::= 'date' '(' (TIME (',' MOD)*)? ')'
```

The date as `YYYY-MM-DD` text. Years before 0 have a leading `-`.

```sql
SELECT date('2024-03-15 13:45:30') AS a, date(1710510330, 'unixepoch') AS b, date('2024-03-15', '+1 month') AS c;
```

| a | b | c |
| --- | --- | --- |
| 2024-03-15 | 2024-03-15 | 2024-04-15 |
