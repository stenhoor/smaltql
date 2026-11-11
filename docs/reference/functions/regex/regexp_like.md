# REGEXP, regexp_like

```ebnf
regexp_like ::= X 'NOT'? 'REGEXP' P | 'regexp_like' '(' X ',' P (',' FLAGS)? ')'
```

1 if the pattern `P` matches anywhere in `X`, else 0. Anchor it with `^` and `$` to match all of `X`. `X REGEXP P` is
`regexp_like(X, P)` and is case-sensitive; pass `'i'` to `regexp_like` to ignore case.

- **Returns:** 1 or 0, or NULL.
- **Errors:** `SMALT_ERROR` for a pattern that doesn't compile (`invalid regular expression "("`, with the reason)
  or a flag other than `i`, `m` and `s`.

```sql
SELECT 'abc' REGEXP 'b.' AS anywhere, 'abc' REGEXP '^b' AS at_start, regexp_like('ABC', 'b', 'i') AS ignoring_case,
       'abc' NOT REGEXP 'z' AS no_z, NULL REGEXP 'a' AS null_text;
```

| anywhere | at_start | ignoring_case | no_z | null_text |
| --- | --- | --- | --- | --- |
| 1 | 0 | 1 | 1 | NULL |

With `m`, `^` and `$` match at each line:

```sql
SELECT regexp_like('first' || char(10) || 'second', '^second$') AS whole_text,
       regexp_like('first' || char(10) || 'second', '^second$', 'm') AS by_line;
```

| whole_text | by_line |
| --- | --- |
| 0 | 1 |
