# hex

```ebnf
hex ::= 'hex' '(' X ')'
```

The bytes of `X` as upper-case hexadecimal. A blob is encoded as is; anything else is first converted to text and its UTF-8 bytes are encoded, so `hex(255)` is the hex of the text `'255'`. NULL gives the empty string, not NULL.

```sql
SELECT hex(x'0aff') AS a, hex('abc') AS b, hex(255) AS c, hex('é') AS d, hex(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| 0AFF | 616263 | 323535 | C3A9 | |

smaltdb has no `unhex()` function; use a blob literal (`x'0aff'`) instead.
