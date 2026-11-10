# Regular expressions

Match, find and replace text with regular expressions. These are smaltdb extensions: SQLite has a `REGEXP` operator
but no function behind it ([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

## Functions {#functions}

- [`regexp_like`](./regexp_like): 1 if the pattern `P` matches anywhere in `X`, else 0.
- [`regexp_substr`](./regexp_substr): The first match of `P` in `X`.
- [`regexp_replace`](./regexp_replace): `X` with the first match of `P` replaced by `R`, or with `g` in `FLAGS`, every match.
- [`regex_match`](./regex_match): The engine's name for [`regexp_like`](./regexp_like): 1 if `P` matches anywhere in `X`, else 0.
- [`regex_find`](./regex_find): The engine's name for [`regexp_substr`](./regexp_substr): the first match of `P` in `X`, or NULL.
- [`regex_replace`](./regex_replace): `X` with the first match of `P` replaced by `R`: [`regexp_replace`](./regexp_replace) without `g`.
- [`regex_replace_all`](./regex_replace_all): `X` with every match of `P` replaced by `R`: [`regexp_replace`](./regexp_replace) with `g`.

## Patterns and flags {#patterns}

- **Patterns** are JavaScript regular expressions in Unicode mode: `\d`, `\w`, `\p{Lu}` (an upper-case letter in any
  script), groups and lookarounds. `.` matches one code point, so `😀` is one character.
- **Flags** are letters in one text argument: `i` ignores case, `m` makes `^` and `$` match at line breaks, `s` lets
  `.` match a line break. `regexp_replace` also takes `g`, to replace every match. NULL flags are no flags.
- **Escapes:** SQL text has no backslash escapes, so `'\d'` reaches the pattern as `\d`, and `'\n'` is a backslash and
  an `n`. Write a line break as `char(10)`.
- **NULL:** a NULL text or pattern gives NULL.
- **Errors:** `SMALT_ERROR` for a pattern that doesn't compile, or for a flag outside those above.
