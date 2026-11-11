# rtrim

```ebnf
rtrim ::= 'rtrim' '(' X ')' | 'rtrim' '(' X ',' CHARS ')'
```

Like [`trim`](./trim), but only from the end of `X`.

```sql
SELECT '[' || trim('  a b  ') || ']' AS a, '[' || ltrim('  a b  ') || ']' AS b, '[' || rtrim('  a b  ') || ']' AS c, trim('xxhixx', 'x') AS d, trim('abcba', 'ab') AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| [a b] | [a b  ] | [  a b] | hi | c |

A number is trimmed as its text form, so a REAL keeps its decimal point:

```sql
SELECT trim(12.0, '1') AS a, rtrim(12.0, '0') AS b, ltrim(-0.5, '-') AS c;
```

| a | b | c |
| --- | --- | --- |
| 2.0 | 12. | 0.5 |
