# pow

```ebnf
pow ::= 'pow' '(' X ',' Y ')' | 'power' '(' X ',' Y ')'
```

`X` raised to the power `Y`. `power` is the same function.

```sql
SELECT pow(2, 10) AS a, power(9, 0.5) AS b, pow(2, -1) AS c, pow(NULL, 2) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 1024 | 3 | 0.5 | NULL |
