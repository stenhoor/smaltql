# lower

```ebnf
lower ::= 'lower' '(' X ')'
```

`X` as text with the ASCII letters `A`–`Z` changed to lower case. Other characters are unchanged, as in SQLite without the ICU extension.

```sql
SELECT lower('Hello World') AS a, lower('ÉCOLE') AS b, lower(42) AS c, typeof(lower(42)) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| hello world | École | 42 | text |
