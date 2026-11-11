# ltrim

```ebnf
ltrim ::= 'ltrim' '(' X ')' | 'ltrim' '(' X ',' CHARS ')'
```

Like [`trim`](./trim), but only from the start of `X`.

```sql
SELECT '[' || ltrim('  hi  ') || ']' AS a, ltrim('xxhixx', 'x') AS b, ltrim('0042', '0') AS c;
```

| a | b | c |
| --- | --- | --- |
| [hi  ] | hixx | 42 |
