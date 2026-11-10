# pragma_foreign_key_list

```ebnf
pragma_foreign_key_list ::= 'pragma_foreign_key_list' '(' TABLE ')'
```

One row per column of each foreign key of `TABLE`. As in SQLite, the last-declared foreign key comes first (`id` 0).

| Column | Meaning |
| --- | --- |
| `id` | Foreign key number. |
| `seq` | Column position within the key, from 0. |
| `table` | Parent table. |
| `from` | Column in `TABLE`. |
| `to` | Parent column, or NULL when the key references the parent's primary key implicitly. |
| `on_update`, `on_delete` | `NO ACTION`, `RESTRICT`, `CASCADE`, `SET NULL` or `SET DEFAULT`. |
| `match` | Always `NONE`. |

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
SELECT "table", "from", "to", on_delete FROM pragma_foreign_key_list('book');
```

| table | from | to | on_delete |
| --- | --- | --- | --- |
| author | author_id | id | CASCADE |
