# regex_find

```ebnf
regex_find ::= 'regex_find' '(' X ',' P (',' FLAGS)? ')'
```

The engine's name for [`regexp_substr`](./regexp_substr): the first match of `P` in `X`, or NULL.

Its `FLAGS` are `i`, `m` and `s`.

```sql
SELECT regex_find('order 1234', '\d+') AS a, regex_find('ABC', 'b', 'i') AS b, regex_find('abc', 'z') AS c;
```

| a | b | c |
| --- | --- | --- |
| 1234 | B | NULL |

Related: [`regex_match`](./regex_match), [`regex_replace`](./regex_replace), [`regex_replace_all`](./regex_replace_all).
