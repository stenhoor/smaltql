# substr

```ebnf
substr ::= ('substr' | 'substring') '(' X ',' START (',' LENGTH)? ')'
```

`substring` is another name for `substr`. Returns the part of `X` that begins at character `START` (the first character is 1) and is `LENGTH` characters long, or runs to the end when `LENGTH` is omitted.

- A negative `START` counts from the end: `-1` is the last character.
- A negative `LENGTH` takes the `|LENGTH|` characters *before* `START`.
- `START` 0 behaves like 1 but the result is one character shorter.
- For a blob, positions and lengths count bytes and the result is a blob. Anything else is treated as text and the result is text.
- If any argument is NULL, the result is NULL.

```sql
SELECT substr('hello', 2, 3) AS a, substr('hello', -3) AS b, substr('hello', 4, -2) AS c, substr('hello', 0, 2) AS d, substring('hello', 10) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| ell | llo | el | h | |

```sql
SELECT substr(x'01020304', 2, 2) AS a, substr(12345, 2, 2) AS b, typeof(substr(12345, 2, 2)) AS c;
```

| a | b | c |
| --- | --- | --- |
| x'0203' | 23 | text |
