# max

```ebnf
max ::= 'max' '(' X (',' Y)+ ')'
```

With two or more arguments, returns the largest argument, or NULL if any argument is NULL. Ordering and collation work as for scalar `min`. With one argument, `max` is the [aggregate function](../aggregate/max).

```sql
SELECT max(3, 1, 2) AS a, max('a', 'B') AS b, max('a' COLLATE NOCASE, 'B') AS c, max(1, x'00') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 3 | a | B | x'00' |

`'a'` is larger than `'B'` in the default `BINARY` collation (it compares UTF-8 bytes); with `NOCASE` it is not.
