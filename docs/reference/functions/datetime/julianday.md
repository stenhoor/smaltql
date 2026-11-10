# julianday

```ebnf
julianday ::= 'julianday' '(' (TIME (',' MOD)*)? ')'
```

The julian day number: days since noon UTC on November 24, 4714 BC in the proleptic Gregorian calendar, as a REAL. Subtracting two julian days gives a difference in days.

```sql
SELECT julianday('2024-03-15') AS a, julianday('2000-01-01 12:00') AS b, julianday('2024-03-16') - julianday('2024-03-01') AS days_between;
```

| a | b | days_between |
| --- | --- | --- |
| 2460384.5 | 2451545 | 15 |
