# from_zone

```ebnf
from_zone ::= 'from_zone' '(' TS ',' ZONE (',' HOW)? ')'
```

The UTC date and time of the wall-clock time `TS` in the time zone `ZONE`.

`ZONE` is an IANA name such as `America/New_York`.

```sql
SELECT from_zone('2026-07-01 08:00:00', 'America/New_York') AS summer, from_zone('2026-12-01 07:00:00', 'America/New_York') AS winter, from_zone(NULL, 'UTC') AS n;
```

| summer | winter | n |
| --- | --- | --- |
| 2026-07-01 12:00:00 | 2026-12-01 12:00:00 | NULL |

Related: [`to_zone`](./to_zone), [`zone_offset`](./zone_offset).
