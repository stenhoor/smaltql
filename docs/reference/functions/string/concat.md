# concat

```ebnf
concat ::= 'concat' '(' X (',' X)* ')'
```

Concatenates the text form of all its arguments, skipping NULLs. It takes at least one argument and never returns NULL: `concat(NULL)` is the empty string. The `||` operator, by contrast, returns NULL if either side is NULL.

```sql
SELECT concat('a', NULL, 1, 2.5) AS a, concat(NULL) AS b, 'a' || NULL AS c;
```

| a | b | c |
| --- | --- | --- |
| a12.5 | | NULL |
