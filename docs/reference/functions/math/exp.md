# exp

```ebnf
exp ::= 'exp' '(' X ')'
```

*e* raised to the power `X`.

```sql
SELECT exp(0) AS a, exp(1) AS b, round(exp(2), 4) AS c, exp(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 1 | 2.718281828459045 | 7.3891 | NULL |
