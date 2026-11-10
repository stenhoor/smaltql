# now

```ebnf
now ::= 'now' '(' ')'
```

The current date and time, in UTC: the same as [`CURRENT_TIMESTAMP`](../datetime/current_timestamp), read once per statement.

```sql
SELECT now() = CURRENT_TIMESTAMP AS same;
```

| same |
| --- |
| 1 |
