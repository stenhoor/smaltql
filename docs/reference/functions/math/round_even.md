# round_even

```ebnf
round_even ::= 'round_even' '(' X ')' | 'round_even' '(' X ',' DIGITS ')'
```

`X` rounded to `DIGITS` places after the point (default 0), with a half rounded to the even digit: `2.5` gives `2`,
`3.5` gives `4`. Whether a value is a half is decided on its exact binary value, so `2.675`, stored just below it,
gives `2.67`. `round` rounds halves away from zero, as in SQLite. A smaltdb extension.

- **Returns:** REAL; NULL for NULL. Text converts as a number, and text that isn't one is 0.

```sql
SELECT round(2.5) AS "round", round_even(2.5) AS even, round_even(3.5) AS odd_up, round_even(-2.5) AS negative,
       round_even(2.675, 2) AS two_places;
```

| round | even | odd_up | negative | two_places |
| --- | --- | --- | --- | --- |
| 3 | 2 | 4 | -2 | 2.67 |
