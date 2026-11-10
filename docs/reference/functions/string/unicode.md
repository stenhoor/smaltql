# unicode

```ebnf
unicode ::= 'unicode' '(' X ')'
```

The Unicode code point of the first character of `X` (as text). An empty string or NULL gives NULL.

```sql
SELECT unicode('A') AS a, unicode('é') AS b, unicode('😀') AS c, unicode('') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 65 | 233 | 128512 | NULL |
