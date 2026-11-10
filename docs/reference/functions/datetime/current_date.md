# current_date

```ebnf
current_date ::= 'CURRENT_DATE'
```

Today's date in UTC, as `YYYY-MM-DD` text. It is the same in every row of a statement.

```sql
SELECT length(CURRENT_DATE) AS chars, CURRENT_DATE = date('now') AS same_as_date_now;
```

| chars | same_as_date_now |
| --- | --- |
| 10 | 1 |

Related: [`current_time`](./current_time), [`current_timestamp`](./current_timestamp).
