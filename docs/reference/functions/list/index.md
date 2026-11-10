# List functions

A list holds values of one type in order, such as the `list<int>` columns of a Parquet file or of a table smaltdf
wrote. SQL shows a list as its JSON text (`[1,2,3]`), and builds one with `ARRAY[…]` or `array_agg`. Positions count
from 1. These functions are smaltdb extensions: SQLite has no lists
([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

The examples on this page use this table:

```sql
CREATE TABLE basket(id INT, items TEXT);
INSERT INTO basket VALUES (1, 'apple'), (1, 'pear'), (1, 'apple'), (2, 'plum');
```

## Functions {#functions}

- [`ARRAY`](./array): A list of the values, in order.
- [`cardinality`](./cardinality): The number of elements in `L`.
- [`list_extract`](./list_extract): The element of `L` at position `I`: 1 is the first, -1 the last.
- [`array_slice`](./array_slice): The elements of `L` from position `FROM` to position `TO`, both included.
- [`array_contains`](./array_contains): 1 if an element of `L` equals `V`, else 0.
- [`array_cat`](./array_cat): The elements of `A`, then the elements of `B`.
- [`array_to_string`](./array_to_string): The elements of `L` as text, joined by `SEP`.
- [`array_sort`](./array_sort): The elements of `L` in ascending order, NULLs first.
- [`array_distinct`](./array_distinct): The elements of `L` without repeats: the first of each, in their order.
- [`array_reverse`](./array_reverse): The elements of `L` in reverse order.
- [`list_sum`](./list_sum): The sum of the non-NULL numbers of the list `L`.
- [`list_mean`](./list_mean): The mean of the non-NULL numbers of the list `L`.
- [`list_min`](./list_min): The least of the non-NULL numbers of the list `L`.
- [`list_max`](./list_max): The greatest of the non-NULL numbers of the list `L`.
- [`array_agg`](./array_agg): An aggregate: the values of `X` in a group, as a list, in the order the rows reach it.
- [`unnest`](./unnest): A table function: one row per element of `L`, in order, in a column named `unnest` (or the alias).

## Rules for every list function {#rules}

- **NULL:** a NULL list gives NULL. NULL elements are kept unless an entry says otherwise.
- **Types:** the functions that compute over elements need one kind of element: `list_sum` and its kin take numbers.
  `ARRAY[…]` itself takes values of any types (`ARRAY['a', 1]` is `["a",1]`).
- **Lists as text:** a list in a result is its JSON text, so a list column reads back in SQL as text (`typeof` gives
  `text`). The functions on this page take lists, not that text.

## Working with lists {#working}

Gather values into lists, then work on the lists:

```sql
SELECT id, cardinality(array_agg(items)) AS n, array_to_string(array_sort(array_distinct(array_agg(items))), ', ') AS kinds
FROM basket GROUP BY id ORDER BY id;
```

| id | n | kinds |
| --- | --- | --- |
| 1 | 3 | apple, pear |
| 2 | 1 | plum |

See also: [aggregate functions](../aggregate/), [`unnest` in FROM](../../sql/select#unnest),
[types](../../sql/types), [smaltdb extensions](../extensions).
