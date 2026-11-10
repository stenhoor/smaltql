# random

```ebnf
random ::= 'random' '(' ')'
```

A pseudo-random 64-bit signed integer, between -9223372036854775808 and 9223372036854775807, from `crypto.getRandomValues`. Each call returns a new value.

```sql
SELECT typeof(random()) AS t, random() BETWEEN -9223372036854775808 AND 9223372036854775807 AS in_range;
```

| t | in_range |
| --- | --- |
| integer | 1 |

Values outside the JavaScript safe-integer range come back to JavaScript as `bigint` (see [Queries](../../../guide/queries)). For a random number in a range, take the remainder:

```sql
SELECT abs(random() % 6) + 1 BETWEEN 1 AND 6 AS die_roll_ok;
```

| die_roll_ok |
| --- |
| 1 |

For random bytes, use [`randomblob`](../scalar/randomblob).
