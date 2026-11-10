# upper_unicode

```ebnf
upper_unicode ::= 'upper_unicode' '(' X ')'
```

`X` in upper case, in every script: `upper` changes only ASCII letters.

```sql
SELECT upper('straße') AS ascii_only, upper_unicode('straße') AS every_script, upper_unicode(NULL) AS n;
```

| ascii_only | every_script | n |
| --- | --- | --- |
| STRAßE | STRASSE | NULL |

Related: [`lower_unicode`](./lower_unicode).
