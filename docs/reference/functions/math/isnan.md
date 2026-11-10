# isnan

```ebnf
isnan ::= 'isnan' '(' X ')'
```

1 when `X` is NaN, else 0. SQL itself gives NULL where IEEE arithmetic gives NaN (`0.0 / 0.0`), but a table another
language wrote (smaltdf, a Parquet file) can hold NaN, and SQL shows it as `NaN`. A smaltdb extension.

- **Returns:** 1 or 0; NULL for NULL.

```sql
SELECT isnan(1.5) AS number, isnan(0.0 / 0.0) AS sql_division, isnan(NULL) AS "null";
```

| number | sql_division | null |
| --- | --- | --- |
| 0 | NULL | NULL |
