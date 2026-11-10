---
# The examples on this page need the @smaltdb/io and @smaltdb/external plugins and the files the docs tests
# register, which the playgrounds do not load.
playground: false
---

# read_csv

```ebnf
read_csv ::= 'read_csv' '(' LOCATION (',' name '=>' VALUE)* ')'
```

Reads CSV (RFC 4180: quoted fields may contain the delimiter, quotes and line breaks). A location ending in `.tsv` is read as tab-separated. Every record must have as many fields as the header.

Column types are inferred from all the values in the column: INTEGER if every non-empty value is an integer, REAL if every value is a number, otherwise TEXT. Header names are trimmed; an empty name becomes `columnN`, and a repeated name gets a suffix (`name_2`). An unquoted empty field is NULL; a quoted empty field (`""`) is the empty string.

```sql
SELECT * FROM read_csv('file:fn-cities.csv');
```

| name | country | population |
| --- | --- | --- |
| Oslo | NO | 709037 |
| Bergen | NO | 291940 |
| Lyon | FR | 522250 |

```sql
SELECT name, typeof(population) AS type FROM read_csv('file:fn-cities.csv') WHERE population > 500000 ORDER BY population DESC;
```

| name | type |
| --- | --- |
| Oslo | integer |
| Lyon | integer |

Without a header row, every record is data. Here the header line is read as data, so the third column contains text and is typed TEXT:

```sql
SELECT * FROM read_csv('file:fn-cities.csv', header => false) LIMIT 2;
```

| column1 | column2 | column3 |
| --- | --- | --- |
| name | country | population |
| Oslo | NO | 709037 |

A file with a comment line, `;` as the delimiter and `NA` for missing values (`fn-weather.csv`):

```
# exported 2024-05-01
city;temp;note
Oslo;12.5;NA
Lyon;NA;"warm; dry"
```

```sql
SELECT city, temp, note, typeof(temp) AS temp_type FROM read_csv('file:fn-weather.csv', skip => 1, delimiter => ';', null => 'NA');
```

| city | temp | note | temp_type |
| --- | --- | --- | --- |
| Oslo | 12.5 | NULL | real |
| Lyon | NULL | warm; dry | null |

Tab-separated and Latin-1 files:

```sql
SELECT * FROM read_csv('file:fn-cities.tsv');
```

| name | country | population |
| --- | --- | --- |
| Oslo | NO | 709037 |
| Lyon | FR | 522250 |

```sql
SELECT * FROM read_csv('file:fn-latin1.csv', encoding => 'latin1');
```

| name | city |
| --- | --- |
| José | Málaga |

<!-- docs:error SMALT_EXTERNAL -->
```sql
SELECT * FROM read_csv('file:fn-cities.csv', delim => ';');
```
