# List functions

A list holds values of one type in order, such as the `list<int>` columns of a Parquet file or of a table smaltdf
wrote. SQL shows a list as its JSON text (`[1,2,3]`), and builds one with `ARRAY[…]` or `array_agg`. Positions count
from 1. These functions are smaltdb extensions: SQLite has no lists
([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)).

| Function | Result |
| --- | --- |
| [`ARRAY[a, b, …]`](#array) | A list of the values |
| [`cardinality(L)`, `array_length(L)`](#cardinality) | The number of elements |
| [`list_extract(L, I)`](#list_extract) | The element at position `I` |
| [`array_slice(L, FROM, TO)`](#array_slice) | The elements from `FROM` to `TO` |
| [`array_contains(L, V)`, `V = ANY (L)`](#array_contains) | 1 if an element equals `V`, else 0 (`= ANY`: three-valued) |
| [`array_cat(A, B)`](#array_cat) | The two lists, one after the other |
| [`array_to_string(L, SEP)`](#array_to_string) | The elements as text, joined by `SEP` |
| [`array_sort(L)`](#array_sort) | The elements sorted |
| [`array_distinct(L)`](#array_distinct) | The elements without repeats |
| [`array_reverse(L)`](#array_reverse) | The elements in reverse order |
| [`list_sum(L)`, `list_mean(L)`, `list_min(L)`, `list_max(L)`](#list_sum) | The sum, mean, least or greatest number |
| [`array_agg(X)`, `implode(X)`](#array_agg) | An aggregate: a group's values as a list |
| [`unnest(L)`](#unnest) | A table function: one row per element |

The examples on this page use this table:

```sql
CREATE TABLE basket(id INT, items TEXT);
INSERT INTO basket VALUES (1, 'apple'), (1, 'pear'), (1, 'apple'), (2, 'plum');
```

## Rules for every list function {#rules}

- **NULL:** a NULL list gives NULL. NULL elements are kept unless an entry says otherwise.
- **Types:** the functions that compute over elements need one kind of element: `list_sum` and its kin take numbers.
  `ARRAY[…]` itself takes values of any types (`ARRAY['a', 1]` is `["a",1]`).
- **Lists as text:** a list in a result is its JSON text, so a list column reads back in SQL as text (`typeof` gives
  `text`). The functions on this page take lists, not that text.

## ARRAY {#array}

```
ARRAY[X, Y, …]
ARRAY[]
```

A list of the values, in order.

- **Arguments:** any number of values, including none.
- **Returns:** a list, shown as JSON text.

```sql
SELECT ARRAY[3, 1, 2] AS numbers, ARRAY['a', NULL] AS with_null, ARRAY[] AS empty;
```

| numbers | with_null | empty |
| --- | --- | --- |
| [3,1,2] | ["a",null] | [] |

## cardinality, array_length {#cardinality}

```
cardinality(L)
array_length(L)
```

The number of elements in `L`. The two names are the same function.

- **Returns:** an integer; NULL elements count.
- **NULL:** NULL for a NULL list.

```sql
SELECT cardinality(ARRAY[1, NULL, 3]) AS n, array_length(ARRAY[]) AS none, cardinality(NULL) AS null_list;
```

| n | none | null_list |
| --- | --- | --- |
| 3 | 0 | NULL |

## list_extract {#list_extract}

```
list_extract(L, I)
```

The element of `L` at position `I`: 1 is the first, -1 the last.

- **Returns:** a value of the list's element type.
- **NULL:** NULL when `I` is 0 or out of range, and for a NULL list or position.

```sql
SELECT list_extract(ARRAY[10, 20, 30], 1) AS first, list_extract(ARRAY[10, 20, 30], -1) AS last,
       list_extract(ARRAY[10, 20, 30], 0) AS zero, list_extract(ARRAY[10, 20, 30], 5) AS out_of_range;
```

| first | last | zero | out_of_range |
| --- | --- | --- | --- |
| 10 | 30 | NULL | NULL |

## array_slice {#array_slice}

```
array_slice(L, FROM, TO)
```

The elements of `L` from position `FROM` to position `TO`, both included. Positions count from 1, and negative ones from the end (`-1` is the last element). Positions past either end are clamped; 0 counts as the start.

- **Returns:** a list of the same type, empty when `FROM` comes after `TO`. NULL when a position is NULL.

```sql
SELECT array_slice(ARRAY[1, 2, 3, 4], 2, 3) AS middle, array_slice(ARRAY[1, 2, 3, 4], -2, -1) AS last_two,
       array_slice(ARRAY[1, 2, 3, 4], 2, -1) AS from_second, array_slice(ARRAY[1, 2, 3, 4], 3, 2) AS empty;
```

| middle | last_two | from_second | empty |
| --- | --- | --- | --- |
| [2,3] | [3,4] | [2,3,4] | [] |

## array_contains, = ANY {#array_contains}

```
array_contains(L, V)
V = ANY (L)
```

1 if an element of `L` equals `V`, else 0.

- **Returns:** 1 or 0.
- **NULL:** the two differ.
  - `V = ANY (L)` is three-valued, as in PostgreSQL and as SQL's `IN` is. It is NULL for a NULL `V` or list, and when no element equals `V` but `L` holds a NULL.
  - `array_contains` is NULL for a NULL list only. A NULL `V` asks whether the list has a NULL element, so it gives 1 or 0.

```sql
SELECT array_contains(ARRAY[1, 2], 2) AS has_two, 3 = ANY (ARRAY[1, 2]) AS has_three,
       3 = ANY (ARRAY[1, NULL]) AS maybe, array_contains(ARRAY[1, NULL], NULL) AS has_null;
```

| has_two | has_three | maybe | has_null |
| --- | --- | --- | --- |
| 1 | 0 | NULL | 1 |

## array_cat {#array_cat}

```
array_cat(A, B)
```

The elements of `A`, then the elements of `B`.

- **Returns:** a list of their common element type.

```sql
SELECT array_cat(ARRAY[1], ARRAY[2, 3]) AS joined;
```

| joined |
| --- |
| [1,2,3] |

## array_to_string {#array_to_string}

```
array_to_string(L, SEP)
```

The elements of `L` as text, joined by `SEP`. NULL elements are left out.

- **Returns:** text; empty text for an empty list.

```sql
SELECT array_to_string(ARRAY['a', NULL, 'b'], '-') AS joined, array_to_string(ARRAY[1, 2], ', ') AS numbers;
```

| joined | numbers |
| --- | --- |
| a-b | 1, 2 |

## array_sort {#array_sort}

```
array_sort(L)
```

The elements of `L` in ascending order, NULLs first.

```sql
SELECT array_sort(ARRAY[2, NULL, 1]) AS sorted, array_sort(ARRAY['pear', 'apple']) AS words;
```

| sorted | words |
| --- | --- |
| [null,1,2] | ["apple","pear"] |

## array_distinct {#array_distinct}

```
array_distinct(L)
```

The elements of `L` without repeats: the first of each, in their order. One NULL is kept.

```sql
SELECT array_distinct(ARRAY[2, 1, 2, NULL, 1]) AS once;
```

| once |
| --- |
| [2,1,null] |

## array_reverse {#array_reverse}

```
array_reverse(L)
```

The elements of `L` in reverse order.

```sql
SELECT array_reverse(ARRAY[1, 2, 3]) AS reversed;
```

| reversed |
| --- |
| [3,2,1] |

## list_sum, list_mean, list_min, list_max {#list_sum}

```
list_sum(L)
list_mean(L)
list_min(L)
list_max(L)
```

Over the non-NULL numbers of `L`: the sum, the mean, the least and the greatest.

- **Arguments:** a list of numbers.
- **Returns:** a number. `list_sum` of no numbers is 0; the others are NULL.
- **Errors:** `SMALT_MISMATCH` for a list of anything but numbers.

```sql
SELECT list_sum(ARRAY[1, 2, 3]) AS total, list_mean(ARRAY[1, 2, 3]) AS mean,
       list_min(ARRAY[3, NULL, 1]) AS least, list_max(ARRAY[3, 1, 2]) AS greatest, list_sum(ARRAY[]) AS none;
```

| total | mean | least | greatest | none |
| --- | --- | --- | --- | --- |
| 6 | 2 | 1 | 3 | 0 |

<!-- docs:error SMALT_MISMATCH -->
```sql
SELECT list_min(ARRAY['b', 'a']);
```

## array_agg, implode {#array_agg}

```
array_agg(X)
implode(X)
```

An aggregate: the values of `X` in a group, as a list, in the order the rows reach it. NULLs are kept. The two names
are the same function.

- **Returns:** a list; an empty group gives an empty list.

```sql
SELECT id, array_agg(items) AS items FROM basket GROUP BY id ORDER BY id;
```

| id | items |
| --- | --- |
| 1 | ["apple","pear","apple"] |
| 2 | ["plum"] |

```sql
SELECT implode(x) AS with_nulls FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3);
```

| with_nulls |
| --- |
| [1,null,3] |

## unnest {#unnest}

```
SELECT … FROM unnest(L) [AS alias]
```

A table function: one row per element of `L`, in order, in a column named `unnest` (or the alias). See
[`unnest` in FROM](../sql/select#unnest) for its options.

```sql
SELECT * FROM unnest(ARRAY[10, 20, 30]);
```

| unnest |
| --- |
| 10 |
| 20 |
| 30 |

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

See also: [aggregate functions](./aggregate), [`unnest` in FROM](../sql/select#unnest),
[types](../sql/types), [smaltdb extensions](./extensions).
