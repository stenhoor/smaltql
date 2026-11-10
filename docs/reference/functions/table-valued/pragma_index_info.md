# pragma_index_info

```ebnf
pragma_index_info ::= 'pragma_index_info' '(' INDEX ')'
```

One row per key column of the index:

| Column | Meaning |
| --- | --- |
| `seqno` | Position in the index key, from 0. |
| `cid` | Column position in the table (`-2` for an expression). |
| `name` | Column name (NULL for an expression). |

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
SELECT * FROM pragma_index_info('book_year');
```

| seqno | cid | name |
| --- | --- | --- |
| 0 | 3 | year |
| 1 | 2 | title |
