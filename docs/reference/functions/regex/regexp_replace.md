# regexp_replace

```ebnf
regexp_replace ::= 'regexp_replace' '(' X ',' P ',' R (',' FLAGS)? ')'
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
