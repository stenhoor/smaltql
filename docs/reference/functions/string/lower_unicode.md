# lower_unicode

```ebnf
lower_unicode ::= 'lower_unicode' '(' X ')'
```

`X` in lower case, in every script: `lower` changes only ASCII letters.

```sql
SELECT lower('ÄÖÜ') AS ascii_only, lower_unicode('ÄÖÜ') AS every_script, lower_unicode(NULL) AS n;
```

| ascii_only | every_script | n |
| --- | --- | --- |
| ÄÖÜ | äöü | NULL |

Related: [`upper_unicode`](./upper_unicode).
