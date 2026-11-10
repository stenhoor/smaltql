# upper

```ebnf
upper ::= 'upper' '(' X ')'
```

`X` as text with the ASCII letters `a`–`z` changed to upper case. Other characters are unchanged.

```sql
SELECT lower('Hello World') AS a, upper('Hello World') AS b, lower('ÉCOLE') AS c, upper('straße') AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| hello world | HELLO WORLD | École | STRAßE |

For case-insensitive comparison of ASCII text, `COLLATE NOCASE` is usually a better fit; see [Expressions](../../sql/expressions).
