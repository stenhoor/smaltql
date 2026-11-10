# trim

```ebnf
trim ::= 'trim' '(' X ')' | 'trim' '(' X ',' CHARS ')'
```

Removes characters from both ends of `X`. Without `CHARS`, it removes spaces (only the space character, not tabs or newlines). With `CHARS`, it removes any character that appears in `CHARS`. NULL in either argument gives NULL.

```sql
SELECT '[' || trim('  hi  ') || ']' AS a, trim('xxhixx', 'x') AS b, trim('abchicba', 'abc') AS c, trim(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| [hi] | hi | hi | NULL |
