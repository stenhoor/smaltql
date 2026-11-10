# octet_length

```ebnf
octet_length ::= 'octet_length' '(' X ')'
```

The number of bytes in the UTF-8 encoding of `X` (for a blob, its size). NULL gives NULL.

```sql
SELECT octet_length('héllo') AS a, octet_length('😀') AS b, octet_length(123) AS c;
```

| a | b | c |
| --- | --- | --- |
| 6 | 4 | 3 |
