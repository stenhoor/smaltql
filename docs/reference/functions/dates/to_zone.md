# to_zone

```ebnf
to_zone ::= 'to_zone' '(' TS ',' ZONE ')'
```

The wall-clock time in the time zone `ZONE` of the UTC date and time `TS`.

`ZONE` is an IANA name such as `America/New_York`.

```sql
SELECT to_zone('2026-07-01 12:00:00', 'America/New_York') AS summer, to_zone('2026-12-01 12:00:00', 'America/New_York') AS winter, to_zone(NULL, 'UTC') AS n;
```

| summer | winter | n |
| --- | --- | --- |
| 2026-07-01 08:00:00 | 2026-12-01 07:00:00 | NULL |

Related: [`from_zone`](./from_zone), [`zone_offset`](./zone_offset).
