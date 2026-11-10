# pragma_index_xinfo

```ebnf
pragma_index_xinfo ::= 'pragma_index_xinfo' '(' INDEX ')'
```

Like `pragma_index_info`, with three more columns, and a final row for the rowid that every index entry also stores:

| Column | Meaning |
| --- | --- |
| `desc` | 1 if the column is sorted descending. |
| `coll` | Collation: `BINARY`, `NOCASE` or `RTRIM`. |
| `key` | 1 for key columns, 0 for the rowid row. |

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
SELECT * FROM pragma_index_xinfo('book_year');
```

| seqno | cid | name | desc | coll | key |
| --- | --- | --- | --- | --- | --- |
| 0 | 3 | year | 1 | BINARY | 1 |
| 1 | 2 | title | 0 | NOCASE | 1 |
| 2 | -1 | NULL | 0 | BINARY | 0 |
