# current_time

```ebnf
current_time ::= 'CURRENT_TIME'
```

The time now in UTC, as `HH:MM:SS` text. It is the same in every row of a statement.

```sql
SELECT length(CURRENT_TIME) AS chars, CURRENT_TIME = time('now') AS same_as_time_now;
```

| chars | same_as_time_now |
| --- | --- |
| 8 | 1 |

Related: [`current_date`](./current_date), [`current_timestamp`](./current_timestamp).
