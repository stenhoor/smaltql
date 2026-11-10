# unlikely

```ebnf
unlikely ::= 'unlikely' '(' X ')'
```

Returns `X` unchanged (SQLite's hint that `X` is usually false; ignored).

```sql
SELECT unlikely(0) AS a, unlikely('no') AS b, unlikely(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 0 | no | NULL |
