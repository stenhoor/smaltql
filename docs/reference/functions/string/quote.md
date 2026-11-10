# quote

```ebnf
quote ::= 'quote' '(' X ')'
```

`X` as an SQL literal: text in single quotes with embedded quotes doubled, blobs as `X'…'`, NULL as the text `NULL`, and numbers in a form that reads back as the same value (a REAL keeps a decimal point or exponent).

```sql
SELECT quote('it''s') AS a, quote(x'0aff') AS b, quote(NULL) AS c, quote(42) AS d, quote(1.0) AS e, quote(1e100) AS f;
```

| a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- |
| 'it''s' | X'0AFF' | NULL | 42 | 1.0 | 1.0e+100 |

The `NULL` in column `c` is the four-letter text `'NULL'`, not an SQL NULL.
