# char

```ebnf
char ::= 'char' '(' (X (',' X)*)? ')'
```

Returns a string made of the characters whose Unicode code points are the arguments. Each argument is converted to an integer: a REAL is truncated, text and blobs use their leading digits (`'65'` is 65, `'1e2'` is 1), and NULL is 0, so it adds the character U+0000. A code point below 0 or above U+10FFFF gives the replacement character U+FFFD. With no arguments, the result is the empty string.

```sql
SELECT char(72, 105) AS a, char(128512) AS b, char() AS c, hex(char(72, NULL, 105)) AS d, hex(char(-1)) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| Hi | 😀 | | 480069 | EFBFBD |

::: warning Differs from SQLite
A code point in the surrogate range U+D800–U+DFFF gives U+FFFD. SQLite encodes it as is, which is not valid UTF-8.
:::
