# Regular expressions

Match, find and replace text with regular expressions. These are smaltdb extensions: SQLite has a `REGEXP` operator
but no function behind it ([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

| Function | Result |
| --- | --- |
| [`X REGEXP P`, `regexp_like(X, P [, FLAGS])`](#regexp_like) | 1 if `P` matches anywhere in `X`, else 0 |
| [`regexp_substr(X, P [, FLAGS])`](#regexp_substr) | The first match, or NULL |
| [`regexp_replace(X, P, R [, FLAGS])`](#regexp_replace) | `X` with the first match, or every match, replaced |
| [`regex_match`, `regex_find`, `regex_replace`, `regex_replace_all`](#regex) | The engine's names for the same functions |

## Patterns and flags {#patterns}

- **Patterns** are JavaScript regular expressions in Unicode mode: `\d`, `\w`, `\p{Lu}` (an upper-case letter in any
  script), groups and lookarounds. `.` matches one code point, so `😀` is one character.
- **Flags** are letters in one text argument: `i` ignores case, `m` makes `^` and `$` match at line breaks, `s` lets
  `.` match a line break. `regexp_replace` also takes `g`, to replace every match. NULL flags are no flags.
- **Escapes:** SQL text has no backslash escapes, so `'\d'` reaches the pattern as `\d`, and `'\n'` is a backslash and
  an `n`. Write a line break as `char(10)`.
- **NULL:** a NULL text or pattern gives NULL.
- **Errors:** `SMALT_ERROR` for a pattern that doesn't compile, or for a flag outside those above.

## REGEXP, regexp_like {#regexp_like}

```
X REGEXP P
X NOT REGEXP P
regexp_like(X, P [, FLAGS])
```

1 if the pattern `P` matches anywhere in `X`, else 0. Anchor it with `^` and `$` to match all of `X`. `X REGEXP P` is
`regexp_like(X, P)` and is case-sensitive; pass `'i'` to `regexp_like` to ignore case.

- **Returns:** 1 or 0, or NULL.

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

<!-- docs:error SMALT_ERROR -->
```sql
SELECT regexp_like('abc', '(');
```

## regexp_substr {#regexp_substr}

```
regexp_substr(X, P [, FLAGS])
```

The first match of `P` in `X`.

- **Returns:** text, or NULL when nothing matches.

```sql
SELECT regexp_substr('order 1234, item 56', '\d+') AS first_number, regexp_substr('ÄÖ ü', '\p{Lu}+') AS capitals,
       regexp_substr('abc', 'z') AS none;
```

| first_number | capitals | none |
| --- | --- | --- |
| 1234 | ÄÖ | NULL |

## regexp_replace {#regexp_replace}

```
regexp_replace(X, P, R [, FLAGS])
```

`X` with the first match of `P` replaced by `R`, or with `g` in `FLAGS`, every match. In `R`, `$1` to `$9` are the
groups of the match, `$&` is the whole match, and `$$` is a `$`.

- **Returns:** text; `X` unchanged when nothing matches.

```sql
SELECT regexp_replace('a1b2', '[0-9]', '#') AS first, regexp_replace('a1b2', '[0-9]', '#', 'g') AS every,
       regexp_replace('2026-11-07', '(\d+)-(\d+)-(\d+)', '$3/$2/$1') AS reordered;
```

| first | every | reordered |
| --- | --- | --- |
| a#b2 | a#b# | 07/11/2026 |

<!-- docs:error SMALT_ERROR -->
```sql
SELECT regexp_replace('abc', 'a', 'b', 'x');
```

## regex_match, regex_find, regex_replace, regex_replace_all {#regex}

```
regex_match(X, P [, FLAGS])
regex_find(X, P [, FLAGS])
regex_replace(X, P, R [, FLAGS])
regex_replace_all(X, P, R [, FLAGS])
```

The engine's own names, which smaltdf and other languages use, also callable from SQL: `regex_match` is
`regexp_like`, `regex_find` is `regexp_substr`, `regex_replace` replaces the first match and `regex_replace_all`
every match. Their `FLAGS` are `i`, `m` and `s`: they take no `g`.

```sql
SELECT regex_match('abc', 'b') AS m, regex_find('ABC', 'b', 'i') AS found,
       regex_replace('a1b2', '[0-9]', '#') AS first, regex_replace_all('a1b2', '[0-9]', '#') AS every;
```

| m | found | first | every |
| --- | --- | --- | --- |
| 1 | B | a#b2 | a#b# |

<!-- docs:error SMALT_ERROR -->
```sql
SELECT regex_replace('a1b2', '[0-9]', '#', 'g');
```

See also: [string functions](./string), [`LIKE` and `GLOB`](../sql/expressions#like-and-glob), [smaltdb extensions](./extensions).
