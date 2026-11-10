# zone_offset

```ebnf
zone_offset ::= 'zone_offset' '(' TS ',' ZONE ')'
```

The offset from UTC of the time zone `ZONE` at the UTC date and time `TS`.

`ZONE` is an IANA name such as `America/New_York`.

```sql
SELECT zone_offset('2026-07-01 12:00:00', 'America/New_York') AS summer, zone_offset('2026-12-01 12:00:00', 'America/New_York') AS winter, zone_offset(NULL, 'UTC') AS n;
```

| summer | winter | n |
| --- | --- | --- |
| -PT4H | -PT5H | NULL |

Related: [`to_zone`](./to_zone), [`from_zone`](./from_zone).
