# Aggregate functions

An aggregate function computes one value from many rows: from each group of a `GROUP BY` query, or from all rows when there is no `GROUP BY`. Every aggregate function can also be used as a [window function](../window/#aggregate-functions-as-window-functions) with an `OVER` clause.

The examples on this page use this table:

```sql
CREATE TABLE sale(region TEXT, product TEXT, qty INT, price REAL);
INSERT INTO sale VALUES
  ('north', 'apple',  3, 0.5),
  ('north', 'pear',   2, 0.75),
  ('north', 'apple',  1, 0.5),
  ('south', 'apple',  4, 0.5),
  ('south', 'plum',   NULL, 1.25);
```

## Functions {#functions}

### General

- [`count`](./count): The number of rows, of non-NULL values of `X`, or of distinct values of `X`.
- [`sum`](./sum): The sum of the non-NULL values of `X`, or NULL when there are none.
- [`total`](./total): Like `sum`, but returns 0 instead of NULL when there are no values, and never fails on integer overflow (it switches to REAL arithmetic instead).
- [`avg`](./avg): The average of the non-NULL values of `X`, or NULL when there are none.
- [`min`](./min): The smallest non-NULL value of `X`, or NULL when there are none.
- [`max`](./max): The largest non-NULL value of `X`, or NULL when there are none.
- [`group_concat`](./group_concat): The non-NULL values of `X`, converted to text and joined.
- [`string_agg`](./string_agg): The same as `group_concat(X, SEP)`, with the separator required (the SQL-standard and PostgreSQL name).
- [`first`](./first): `X` at the group's first row, or at the row with the least `KEY`. `arg_min(X, KEY)` is the same as `first(X, KEY)`.
- [`last`](./last): `X` at the group's last row, or at the row with the greatest `KEY`. `arg_max(X, KEY)` is the same as `last(X, KEY)`.

### Statistical aggregates

- [`var_samp`](./var_samp): The sample variance of the non-NULL values of `X`. `variance` is the same function.
- [`var_pop`](./var_pop): The population variance of the non-NULL values of `X`.
- [`stddev_samp`](./stddev_samp): The sample standard deviation of the non-NULL values of `X`. `stddev` is the same function.
- [`stddev_pop`](./stddev_pop): The population standard deviation of the non-NULL values of `X`.
- [`covar_samp`](./covar_samp): The sample covariance of the pairs (`Y`, `X`).
- [`covar_pop`](./covar_pop): The population covariance of the pairs (`Y`, `X`).
- [`corr`](./corr): Pearson's correlation coefficient of the pairs (`Y`, `X`), from -1 to 1.
- [`skewness`](./skewness): The sample skewness (asymmetry) of the values of `X`, with bias correction, as in DuckDB and Excel (`SKEW`).
- [`skewness_pop`](./skewness_pop): The population skewness of the values of `X`, as pandas and Polars compute it with `bias=True`.
- [`kurtosis`](./kurtosis): The sample excess kurtosis (tailedness: 0 for a normal distribution) of the values of `X`, with bias correction, as in DuckDB and Excel (`KURT`).
- [`kurtosis_pop`](./kurtosis_pop): The population excess kurtosis of the values of `X`, as pandas and Polars compute it with `bias=True`.
- [`median`](./median): The median of the values of `X`: `percentile_cont(X, 0.5)`, as in SQLite.
- [`percentile`](./percentile): The `P`th percentile of the values of `X`, `P` from 0 to 100, interpolating between the two nearest values.
- [`percentile_cont`](./percentile_cont): The percentile `F` of the values of `X`, `F` from 0 to 1, interpolating between the two nearest values.
- [`percentile_disc`](./percentile_disc): The percentile `F` of the values of `X`, `F` from 0 to 1, as one of the values: the one at position `F` × (n − 1), rounded down, in sorted order.

## Syntax

```
name(*)                                -- count only
name([DISTINCT] X [, Y]) [FILTER (WHERE condition)]
```

- **NULL**: every aggregate except `count(*)` ignores rows where `X` is NULL.
- **Empty input**: with no rows (or only NULLs), `count` returns 0, `total` returns 0, and the others return NULL.
- **`DISTINCT`**: removes duplicate values of `X` before aggregating. It is only allowed with exactly one argument, so `group_concat(DISTINCT X)` works but `group_concat(DISTINCT X, ';')` and `string_agg(DISTINCT X, ';')` fail with `SMALT_ERROR`: `DISTINCT aggregates must have exactly one argument`, as in SQLite.
- **`FILTER (WHERE …)`**: only rows for which the condition is true are fed to the aggregate. `FILTER` is only valid with aggregate functions.
- **`ORDER BY` inside the call** (`group_concat(x, ',' ORDER BY y)`, SQLite 3.44+) is **not supported**: it fails with `SMALT_UNSUPPORTED`. To control the order of `group_concat`, aggregate over an ordered subquery (see [group_concat](./group_concat)).
- An aggregate cannot be used in `WHERE`; filter groups with `HAVING`. See [SELECT](../../sql/select).

```sql
SELECT count(*) AS rows, count(qty) AS with_qty, count(DISTINCT product) AS products,
       sum(qty) FILTER (WHERE product = 'apple') AS apples
FROM sale;
```

| rows | with_qty | products | apples |
| --- | --- | --- | --- |
| 5 | 4 | 3 | 8 |

### Bare columns with min and max

As in SQLite, when a query has exactly one `min()` or `max()` aggregate, other columns that are not aggregated or grouped take their values from the row that holds the minimum or maximum:

```sql
SELECT product, max(qty) AS most FROM sale;
```

| product | most |
| --- | --- |
| apple | 4 |

## Statistics {#statistics}

The statistical aggregates skip NULLs, convert text and blobs to numbers like [`sum`](./sum) and [`avg`](./avg) do, and return a REAL, or NULL when the statistic is undefined (too few values, or no spread for `corr`, `skewness` and `kurtosis`). They are computed in one pass with numerically stable updates, so data with a large common offset, such as timestamps or prices in cents, keeps its precision. They work with `DISTINCT`, `FILTER` and as [window functions](../window/#aggregate-functions-as-window-functions); over a sliding frame (`ROWS 20 PRECEDING`), the variance, standard deviation, median and percentiles update as rows enter and leave the frame instead of recomputing it.

The names are PostgreSQL's (`var_samp`, `stddev_samp`, `covar_samp`, `corr`), with `variance` and `stddev` for the sample statistics. `skewness` and `kurtosis` are DuckDB's. `median` and the `percentile` functions are SQLite's.

### Moving statistics {#moving-statistics}

With a window frame, the statistics move along the rows, as rolling functions do in dataframe libraries:

```sql
WITH w(x) AS (VALUES (1), (2), (4), (7), (11))
SELECT x, round(var_samp(x) OVER (ORDER BY x ROWS 2 PRECEDING), 4) AS moving_var, median(x) OVER (ORDER BY x ROWS 2 PRECEDING) AS moving_median FROM w ORDER BY x;
```

| x | moving_var | moving_median |
| --- | --- | --- |
| 1 | NULL | 1 |
| 2 | 0.5 | 1.5 |
| 4 | 2.3333 | 2 |
| 7 | 6.3333 | 4 |
| 11 | 12.3333 | 7 |

## Not available

`json_group_array` and `json_group_object` are not implemented and fail with `no such function`.
