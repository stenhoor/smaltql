# instr

```ebnf
instr ::= 'instr' '(' X ',' Y ')'
```

The position (1-based, in characters) of the first occurrence of `Y` in `X`, or 0 when `Y` does not occur. An empty `Y` gives 1. If either argument is a blob, both are compared as bytes and the position counts bytes. NULL in either argument gives NULL.

```sql
SELECT instr('héllo', 'l') AS a, instr('hello', 'z') AS b, instr(x'010203', x'03') AS c, instr(12345, 34) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 3 | 0 | 3 | 3 |
