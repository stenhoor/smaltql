# pragma_table_xinfo

```ebnf
pragma_table_xinfo ::= 'pragma_table_xinfo' '(' TABLE ')'
```

The rows and columns of `pragma_table_info`, plus a seventh column, `hidden`, as in SQLite. SQLite uses it for hidden columns of virtual tables (1) and generated columns (2, 3); smaltdb has neither, so it is always 0.

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
SELECT name, hidden FROM pragma_table_xinfo('author');
```

| name | hidden |
| --- | --- |
| id | 0 |
| name | 0 |
| born | 0 |
