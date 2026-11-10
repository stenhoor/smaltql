# likely

```ebnf
likely ::= 'likely' '(' X ')'
```

Returns `X` unchanged. In SQLite it tells the query planner that `X` is usually true; smaltdb accepts it for compatibility and ignores the hint.

```sql
SELECT likely(1) AS a, likely('yes') AS b, likely(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | yes | NULL |
