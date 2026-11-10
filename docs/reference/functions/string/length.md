# length

```ebnf
length ::= 'length' '(' X ')'
```

For text, the number of characters. For a blob, the number of bytes. For a number, the length of its text form. NULL gives NULL.

```sql
SELECT length('héllo') AS a, length('😀') AS b, length(x'010203') AS c, length(12.50) AS d, length(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| 5 | 1 | 3 | 4 | NULL |

`12.50` is the REAL 12.5, whose text form `12.5` has four characters.
