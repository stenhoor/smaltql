# replace

```ebnf
replace ::= 'replace' '(' X ',' Y ',' Z ')'
```

`X` with every occurrence of `Y` replaced by `Z`. Occurrences are found from left to right and do not overlap. If `Y` is empty, `X` is returned unchanged. If any argument is NULL, the result is NULL.

```sql
SELECT replace('hello', 'l', 'L') AS a, replace('aaa', 'aa', 'b') AS b, replace('abc', '', 'x') AS c, replace(123, 2, 9) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| heLLo | ba | abc | 193 |
