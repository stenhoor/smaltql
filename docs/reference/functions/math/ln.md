# ln

```ebnf
ln ::= 'ln' '(' X ')'
```

The natural logarithm of `X`.

`X` at or below 0 gives NULL.

```sql
SELECT ln(1) AS a, round(ln(exp(2)), 10) AS b, ln(0) AS c, ln(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 0 | 2 | NULL | NULL |

Related: [`log`](./log), [`log10`](./log10), [`log2`](./log2).
