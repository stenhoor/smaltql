# ARRAY

```ebnf
array ::= 'ARRAY' '[' (X (',' X)*)? ']'
```

A list of the values, in order. Write `ARRAY[` with no space: with one, `[` starts a bracket-quoted name, as in SQLite,
so `ARRAY [1]` is not a list.

- **Arguments:** any number of values, including none.
- **Returns:** a list, shown as JSON text.

```sql
SELECT ARRAY[3, 1, 2] AS numbers, ARRAY['a', NULL] AS with_null, ARRAY[] AS empty;
```

| numbers | with_null | empty |
| --- | --- | --- |
| [3,1,2] | ["a",null] | [] |
