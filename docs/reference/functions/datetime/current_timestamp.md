# current_timestamp

```ebnf
current_timestamp ::= 'CURRENT_TIMESTAMP'
```

The date and time now in UTC, as `YYYY-MM-DD HH:MM:SS` text. It is the same in every row of a statement.

```sql
SELECT length(CURRENT_TIMESTAMP) AS chars, CURRENT_TIMESTAMP = datetime('now') AS same_as_datetime_now;
```

| chars | same_as_datetime_now |
| --- | --- |
| 19 | 1 |

Related: [`current_date`](./current_date), [`current_time`](./current_time).
