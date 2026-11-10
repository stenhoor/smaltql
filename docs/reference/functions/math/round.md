# round

```ebnf
round ::= 'round' '(' X ')' | 'round' '(' X ',' DIGITS ')'
```

`X` rounded to `DIGITS` digits after the decimal point (default 0). Halves round away from zero. `DIGITS` is clamped to the range 0–30, so a negative value means 0. The result is always REAL. Text is converted to a number first. If `X` or `DIGITS` is NULL, the result is NULL.

```sql
SELECT round(2.5) AS a, round(-2.5) AS b, round(1.2345, 2) AS c, round('3.7') AS d, round(1234.5, -2) AS e, typeof(round(3)) AS f;
```

| a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- |
| 3 | -3 | 1.23 | 4 | 1235 | real |

Rounding works on the binary value, so a number such as 2.675 (stored as 2.67499999…) rounds down, as in SQLite:

```sql
SELECT round(2.675, 2) AS r;
```

| r |
| --- |
| 2.67 |
