# log

```ebnf
log ::= 'log' '(' X ')' | 'log' '(' B ',' X ')'
```

The base-10 logarithm of `X`; with two arguments, the base-`B` logarithm of `X`.

`X` at or below 0 gives NULL.

```sql
SELECT log(100) AS a, log(2, 8) AS b, log(-1) AS c, log(NULL) AS d;
```

| a | b | c | d |
| --- | --- | --- | --- |
| 2 | 3 | NULL | NULL |

Related: [`ln`](./ln), [`log10`](./log10), [`log2`](./log2).
