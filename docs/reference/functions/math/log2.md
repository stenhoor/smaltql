# log2

```ebnf
log2 ::= 'log2' '(' X ')'
```

The base-2 logarithm of `X`.

`X` at or below 0 gives NULL.

```sql
SELECT log2(8) AS a, log2(0.5) AS b, log2(NULL) AS c;
```

| a | b | c |
| --- | --- | --- |
| 3 | -1 | NULL |

Related: [`ln`](./ln), [`log`](./log), [`log10`](./log10).
