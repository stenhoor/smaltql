# DATE, TIME, TIMESTAMP literals

```ebnf
typed-literals ::= 'DATE' string-literal | 'TIME' string-literal | 'TIMESTAMP' string-literal
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
