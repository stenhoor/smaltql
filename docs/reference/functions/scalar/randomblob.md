# randomblob

```ebnf
randomblob ::= 'randomblob' '(' N ')'
```

Returns a blob of `N` cryptographically random bytes (from `crypto.getRandomValues`). If `N` is less than 1 or NULL, the result is a 1-byte blob.

```sql
SELECT length(randomblob(16)) AS a, length(randomblob(0)) AS b, typeof(randomblob(4)) AS c;
```

| a | b | c |
| --- | --- | --- |
| 16 | 1 | blob |

A common use is generating random identifiers:

```sql
SELECT length(hex(randomblob(16))) AS hex_digits;
```

| hex_digits |
| --- |
| 32 |
