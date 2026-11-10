---
# The examples on this page need the @smaltdb/io and @smaltdb/external plugins and the files the docs tests
# register, which the playgrounds do not load.
playground: false
---

# read_json

```ebnf
read_json ::= 'read_json' '(' LOCATION (',' name '=>' VALUE)* ')'
```

Reads either a JSON array (the file starts with `[`) or NDJSON (one JSON value per line; blank lines are skipped). The items must be all objects or all arrays:

- **Objects**: each key becomes a column, in the order keys are first seen; keys match case-insensitively. A key missing from an object is NULL.
- **Arrays**: the columns are `column1`, `column2`, …, as many as the longest array.

Values convert as follows: numbers and strings stay as they are, `true`/`false` become 1/0, `null` is NULL, and nested objects and arrays become JSON text. A column is typed INTEGER, REAL or TEXT when all its values have that type (INTEGER and REAL mix to REAL), otherwise it has no type.

```sql
SELECT * FROM read_json('file:fn-cities.json');
```

| name | country | population | capital |
| --- | --- | --- | --- |
| Oslo | NO | 709037 | NULL |
| Lyon | FR | 522250 | 0 |

`fn-items.ndjson` holds one object per line:

```
{"id": 1, "tags": ["a", "b"], "price": 9.5}
{"id": 2, "tags": null, "price": 12}
```

```sql
SELECT id, tags, price, typeof(tags) AS tags_type FROM read_json('file:fn-items.ndjson');
```

| id | tags | price | tags_type |
| --- | --- | --- | --- |
| 1 | ["a","b"] | 9.5 | text |
| 2 | NULL | 12 | null |

smaltdb has no JSON functions (`json_extract`, `->>`, …), so nested values can only be handled as text.
