# abs

```ebnf
abs ::= 'abs' '(' X ')'
```

The absolute value of `X`. Integers stay integers and REALs stay REAL. Text and blobs are converted to a number first (text that is not a number gives 0). NULL gives NULL. `abs(-9223372036854775808)` fails with `SMALT_ERROR`: `integer overflow`, because the result does not fit in a 64-bit integer.

```sql
SELECT abs(-5) AS a, abs(-2.5) AS b, abs('-3') AS c, abs('x') AS d, abs(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| 5 | 2.5 | 3 | 0 | NULL |
