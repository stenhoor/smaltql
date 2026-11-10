# regex_match

```ebnf
regex_match ::= 'regex_match' '(' X ',' P (',' FLAGS)? ')'
```

The engine's name for [`regexp_like`](./regexp_like): 1 if `P` matches anywhere in `X`, else 0.

Its `FLAGS` are `i`, `m` and `s`.

```sql
SELECT regex_match('abc', 'b') AS a, regex_match('ABC', 'b', 'i') AS b, regex_match(NULL, 'b') AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | 1 | NULL |

Related: [`regex_find`](./regex_find), [`regex_replace`](./regex_replace), [`regex_replace_all`](./regex_replace_all).
