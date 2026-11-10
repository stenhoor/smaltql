# unixepoch

```ebnf
unixepoch ::= 'unixepoch' '(' (TIME (',' MOD)*)? ')'
```

Seconds since 1970-01-01 00:00:00 UTC, as an INTEGER (fractions are truncated). With the `subsec` modifier the result is a REAL with milliseconds.

```sql
SELECT unixepoch('2024-03-15 13:45:30') AS a, unixepoch('2024-03-15 13:45:30.250', 'subsec') AS b, unixepoch('1970-01-01') AS c, (unixepoch('2024-03-15 13:45') - unixepoch('2024-03-15 08:00')) / 60 AS minutes;
```

| a | b | c | minutes |
| --- | --- | --- | --- |
| 1710510330 | 1710510330.25 | 0 | 345 |

::: warning Differs from SQLite
With `subsec`, a result that is a whole number of seconds is reported by `typeof` as `'integer'` (SQLite: `'real'`). The value is the same. See [Types](../../sql/types).
:::
