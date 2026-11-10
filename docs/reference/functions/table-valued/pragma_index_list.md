# pragma_index_list

```ebnf
pragma_index_list ::= 'pragma_index_list' '(' TABLE ')'
```

One row per index on `TABLE`:

| Column | Meaning |
| --- | --- |
| `seq` | Sequence number, from 0. |
| `name` | Index name. Indexes created for `UNIQUE` and `PRIMARY KEY` constraints are named `smalt_autoindex_<table>_<n>` (SQLite: `sqlite_autoindex_…`). |
| `unique` | 1 for a unique index. |
| `origin` | `c` for `CREATE INDEX`, `u` for a `UNIQUE` constraint, `pk` for a `PRIMARY KEY` constraint. |
| `partial` | 1 for a partial index (with `WHERE`). |

The examples on this page use these tables and this index:

```sql
CREATE TABLE author(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, born INT DEFAULT 1900);
CREATE TABLE book(
  id INTEGER PRIMARY KEY,
  author_id INT REFERENCES author(id) ON DELETE CASCADE,
  title TEXT COLLATE NOCASE,
  year INT
);
CREATE INDEX book_year ON book(year DESC, title);
```

```sql
SELECT * FROM pragma_index_list('author');
```

| seq | name | unique | origin | partial |
| --- | --- | --- | --- | --- |
| 0 | smalt_autoindex_author_1 | 1 | u | 0 |
