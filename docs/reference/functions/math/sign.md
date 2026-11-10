# sign

```ebnf
sign ::= 'sign' '(' X ')'
```

`-1`, `0` or `1` for a negative, zero or positive number. Text that is a number, with optional spaces around it (`'3'`, `' -2.5 '`, `'1e3'`), counts as that number; other text, blobs and NULL give NULL.

```sql
SELECT sign(-2.5) AS a, sign(0) AS b, sign(42) AS c, sign(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| -1 | 0 | 1 | NULL |

```sql
SELECT sign('3') AS a, sign(' -2.5 ') AS b, sign('3x') AS c, sign(x'01') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 1 | -1 | NULL | NULL |
