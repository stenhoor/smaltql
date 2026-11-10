# log10

```ebnf
log10 ::= 'log10' '(' X ')'
```

The base-10 logarithm of `X`.

`X` at or below 0 gives NULL.

```sql
SELECT log10(1000) AS a, log10(0) AS b, log10(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 3 | NULL | NULL |

Related: [`ln`](./ln), [`log`](./log), [`log2`](./log2).
