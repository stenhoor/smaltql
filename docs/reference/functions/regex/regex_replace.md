# regex_replace

```ebnf
regex_replace ::= 'regex_replace' '(' X ',' P ',' R (',' FLAGS)? ')'
```

`X` with the first match of `P` replaced by `R`: [`regexp_replace`](./regexp_replace) without `g`.

Its `FLAGS` are `i`, `m` and `s`: it takes no `g` (use `regex_replace_all`).

```sql
SELECT regex_replace('a1b2', '[0-9]', '#') AS a, regex_replace(NULL, 'a', 'b') AS b;
```

| a | b |
| --- | --- |
| a#b2 | NULL |

Related: [`regex_match`](./regex_match), [`regex_find`](./regex_find), [`regex_replace_all`](./regex_replace_all).
