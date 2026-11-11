# iif

```ebnf
iif ::= 'iif' '(' COND ',' X (',' Y)? ')' | ('iif' | 'if') '(' COND ',' X (',' COND ',' X)+ (',' ELSE)? ')'
```

Returns `X` when `COND` is true and `Y` otherwise. `COND` is true when it is a non-zero number; text and blobs are converted to a number first (`'abc'` counts as 0), and NULL counts as false. It is the same as `CASE WHEN COND THEN X ELSE Y END`, and only the chosen argument is evaluated.

With two arguments, the result is NULL when `COND` is false. With more, the arguments are condition/value pairs tried in order, and an odd last argument is the value when no condition is true (NULL without one). `if` is another name for `iif` (both as in SQLite 3.48 and later). Fewer than two arguments fail with `SMALT_ERROR`: `wrong number of arguments to function iif()`.

```sql
SELECT iif(5 > 3, 'yes', 'no') AS a, iif(NULL, 'yes', 'no') AS b, iif('0.5', 'yes', 'no') AS c;
```

| a | b | c |
| --- | --- | --- |
| yes | no | yes |

```sql
SELECT iif(0, 'yes') AS a, iif(0, 'one', 1, 'two') AS b, if(0, 'one', 0, 'two', 'other') AS c;
```

| a | b | c |
| --- | --- | --- |
| NULL | two | other |
