---
# The examples on this page need the @smaltdb/parquet plugin, which the playgrounds do not load.
playground: false
---

# read_parquet

```ebnf
read_parquet ::= 'read_parquet' '(' LOCATION (',' name '=>' VALUE)* ')'
```

Reads a Parquet file. Only the columns the query uses are fetched, and row groups whose statistics rule them out are skipped; for remote files this uses HTTP range requests. `read_parquet` is provided by the [`@smaltdb/parquet` plugin](../../../guide/plugins) (which reads every common codec: Snappy, gzip, zstd, Brotli and LZ4); without the plugin the call fails with `SMALT_PLUGIN_MISSING`: `the parquet format needs the @smaltdb/parquet plugin`.

| Parquet type | SQL value |
| --- | --- |
| BOOLEAN | INTEGER 0 or 1 |
| INT32, INT64 | INTEGER |
| FLOAT, DOUBLE, DECIMAL, FLOAT16 | REAL |
| STRING, ENUM, JSON, UUID | TEXT |
| DATE | TEXT `YYYY-MM-DD` (declared type `DATE`) |
| TIMESTAMP, INT96 | TEXT `YYYY-MM-DD HH:MM:SS` in UTC, then `.123` or `.123456` when there is a fraction of a second (declared type `TIMESTAMP`) |
| other binary | BLOB |
| lists, structs, maps | TEXT holding JSON |

DATE and TIMESTAMP columns are dates and times to the engine (`date` and `datetime`, [smaltdb ADR
0019](https://smaltdb.dev/adr/0019-dates-and-times)), which SQL reads as their text: see [date and time
columns](../datetime/#columns). A comparison with a literal written the same way (`founded >= '1050-01-01'`) still lets the
engine skip row groups by their statistics.

<!-- docs:plugin @smaltdb/parquet -->
```sql
SELECT * FROM read_parquet('file:fn-cities.parquet');
```

| name | country | population | founded |
| --- | --- | --- | --- |
| Oslo | NO | 709037 | 1048-01-01 |
| Bergen | NO | 291940 | 1070-01-01 |
| Lyon | FR | 522250 | NULL |

The read functions combine with each other and with tables:

<!-- docs:plugin @smaltdb/parquet -->
```sql
SELECT c.name, c.population, p.founded
FROM read_csv('file:fn-cities.csv') AS c
JOIN read_parquet('file:fn-cities.parquet') AS p USING (name)
WHERE p.founded IS NOT NULL
ORDER BY c.name;
```

| name | population | founded |
| --- | --- | --- |
| Bergen | 291940 | 1070-01-01 |
| Oslo | 709037 | 1048-01-01 |

Reading from a URL or object store looks the same (not run here, since it needs the network):

<!-- docs:skip -->
```sql
SELECT count(*) FROM read_parquet('https://example.com/data/trips.parquet');
SELECT * FROM read_csv('s3://my-bucket/2024/*.csv', connection => 'lake');
```
