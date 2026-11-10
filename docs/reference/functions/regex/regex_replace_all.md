# regex_replace_all

```ebnf
regex_replace_all ::= 'regex_replace_all' '(' X ',' P ',' R (',' FLAGS)? ')'
```

`X` with every match of `P` replaced by `R`: [`regexp_replace`](./regexp_replace) with `g`.

Its `FLAGS` are `i`, `m` and `s`.

```sql
SELECT regex_replace_all('a1b2', '[0-9]', '#') AS a, regex_replace_all('A1a2', 'a', '_', 'i') AS b;
```

| a | b |
| --- | --- |
| a#b# | _1_2 |

Related: [`regex_match`](./regex_match), [`regex_find`](./regex_find), [`regex_replace`](./regex_replace).
