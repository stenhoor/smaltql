# regexp_substr

```ebnf
regexp_substr ::= 'regexp_substr' '(' X ',' P (',' FLAGS)? ')'
```

The first match of `P` in `X`.

- **Returns:** text, or NULL when nothing matches.
- **Errors:** `SMALT_ERROR` for a pattern that doesn't compile or a flag other than `i`, `m` and `s`.

```sql
SELECT regexp_substr('order 1234, item 56', '\d+') AS first_number, regexp_substr('ÄÖ ü', '\p{Lu}+') AS capitals,
       regexp_substr('abc', 'z') AS none;
```

| first_number | capitals | none |
| --- | --- | --- |
| 1234 | ÄÖ | NULL |
