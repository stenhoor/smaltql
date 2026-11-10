# pragma_table_info

```ebnf
pragma_table_info ::= 'pragma_table_info' '(' TABLE ')'
```

One row per column of `TABLE`:

| Column | Meaning |
| --- | --- |
| `cid` | Position of the column, from 0. |
| `name` | Column name. |
| `type` | Declared type, as written (empty if none). |
| `notnull` | 1 if the column was declared `NOT NULL`. |
| `dflt_value` | The `DEFAULT` expression as SQL text, or NULL. |
| `pk` | Position in the primary key (from 1), or 0. |

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
SELECT * FROM pragma_table_info('author');
```

| cid | name | type | notnull | dflt_value | pk |
| --- | --- | --- | --- | --- | --- |
| 0 | id | INTEGER | 0 | NULL | 1 |
| 1 | name | TEXT | 1 | NULL | 0 |
| 2 | born | INT | 0 | 1900 | 0 |

Every column of every table:

```sql
SELECT m.name AS table_name, p.name AS column_name, p.type
FROM sqlite_schema AS m, pragma_table_info(m.name) AS p
WHERE m.type = 'table'
ORDER BY m.name, p.cid;
```

| table_name | column_name | type |
| --- | --- | --- |
| author | id | INTEGER |
| author | name | TEXT |
| author | born | INT |
| book | id | INTEGER |
| book | author_id | INT |
| book | title | TEXT |
| book | year | INT |

Unknown table:

```sql
SELECT count(*) AS n FROM pragma_table_info('no_such_table');
```

| n |
| --- |
| 0 |
