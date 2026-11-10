# concat_ws

```ebnf
concat_ws ::= 'concat_ws' '(' SEP (',' X)+ ')'
```

Concatenates the non-NULL arguments after the first, with `SEP` between them. If `SEP` is NULL, the result is NULL. It takes at least two arguments.

```sql
SELECT concat_ws('-', '2024', '03', NULL, '15') AS a, concat_ws(', ', NULL) AS b, concat_ws(NULL, 'a', 'b') AS c;
```

| a | b | c |
| --- | --- | --- |
| 2024-03-15 | | NULL |
