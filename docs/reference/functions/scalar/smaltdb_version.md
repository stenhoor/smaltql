# smaltdb_version

```ebnf
smaltdb_version ::= 'smaltdb_version' '(' ')'
```

Returns the version of the smaltdb package as text, such as `'0.9.0'` (the `version` in its `package.json`). smaltdb has no `sqlite_version()` function.

```sql
SELECT smaltdb_version() GLOB '[0-9]*.[0-9]*.[0-9]*' AS is_version;
```

| is_version |
| --- |
| 1 |
