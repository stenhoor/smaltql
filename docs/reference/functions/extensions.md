# smaltdb extensions

Functions SQLite doesn't have, which smaltql calls from smaltdb's engine ([ADR 0022](https://smaltdb.dev/adr/0022-sql-for-the-new-engine-features)). They read and give values as SQL holds them: dates and times as text, lists as JSON text. Other engine functions are not SQL: calling one fails with `no such function`.

This page lists them; each links to its page, with its arguments, NULL handling, errors and examples.

## Dates and times {#dates}

| Function | Result |
| --- | --- |
| [`make_date(Y, M, D)`](./dates/make_date) | A date from its parts |
| [`make_datetime(…)`, `make_timestamp(…)`](./dates/make_datetime) | A date and time from its parts |
| [`year`](./dates/year), [`month`](./dates/month), [`day`](./dates/day), [`weekday`](./dates/weekday), [`day_of_year`](./dates/day_of_year) | A part of a date |
| [`hour`](./dates/hour), [`minute`](./dates/minute), [`second`](./dates/second), [`microsecond`](./dates/microsecond) | A part of a time |
| [`EXTRACT(FIELD FROM X)`, `date_part(FIELD, X)`](./dates/extract) | A part named by a field |
| [`date_trunc(UNIT, X)`](./dates/date_trunc) | A date or time cut to the start of a unit |
| [`strptime(TEXT, FORMAT)`](./dates/strptime) | Text read as a date and time |
| [`offset_by(X, OFFSET)`](./dates/offset_by) | A date or time moved by an offset |
| [`now()`](./dates/now) | The current date and time |
| [`DATE '…'`, `TIME '…'`, `TIMESTAMP '…'`](./dates/typed-literals) | Typed literals |
| [`INTERVAL '…'`](./dates/interval) | Added to or subtracted from a date or time |

## Time zones {#zones}

| Function | Result |
| --- | --- |
| [`to_zone(TS, ZONE)`](./dates/to_zone) | The wall-clock time in a zone of a UTC instant |
| [`from_zone(TS, ZONE [, HOW])`](./dates/from_zone) | The UTC instant of a wall-clock time in a zone |
| [`zone_offset(TS, ZONE)`](./dates/zone_offset) | A zone's offset from UTC |

## Lists {#lists}

| Function | Result |
| --- | --- |
| [`ARRAY[…]`](./list/array) | A list of the values |
| [`cardinality(L)`, `array_length(L)`](./list/cardinality) | The number of elements |
| [`list_extract(L, I)`](./list/list_extract) | The element at a position |
| [`array_slice(L, FROM, TO)`](./list/array_slice) | Part of a list |
| [`array_contains(L, V)`, `V = ANY (L)`](./list/array_contains) | Whether an element equals `V` |
| [`array_cat(A, B)`](./list/array_cat) | Two lists joined |
| [`array_to_string(L, SEP)`](./list/array_to_string) | The elements as text |
| [`array_sort`](./list/array_sort), [`array_distinct`](./list/array_distinct), [`array_reverse`](./list/array_reverse) | The elements sorted, without repeats, or reversed |
| [`list_sum`](./list/list_sum), [`list_mean`](./list/list_mean), [`list_min`](./list/list_min), [`list_max`](./list/list_max) | The sum, mean, least or greatest number |
| [`array_agg(X)`, `implode(X)`](./list/array_agg) | An aggregate: a group's values as a list |
| [`unnest(L)`](./list/unnest) | A table function: one row per element |

## Text {#text}

| Function | Result |
| --- | --- |
| [`lower_unicode(X)`](./string/lower_unicode), [`upper_unicode(X)`](./string/upper_unicode) | Lower or upper case of every script |

## Regular expressions {#regexp}

| Function | Result |
| --- | --- |
| [`X REGEXP P`, `regexp_like(X, P [, FLAGS])`](./regex/regexp_like) | Whether a pattern matches |
| [`regexp_substr(X, P [, FLAGS])`](./regex/regexp_substr) | The first match |
| [`regexp_replace(X, P, R [, FLAGS])`](./regex/regexp_replace) | The first match, or every match, replaced |
| [`regex_match`](./regex/regex_match), [`regex_find`](./regex/regex_find), [`regex_replace`](./regex/regex_replace), [`regex_replace_all`](./regex/regex_replace_all) | The engine's names for the same functions |

## Aggregates {#first-last}

| Function | Result |
| --- | --- |
| [`first(X [, KEY])`](./aggregate/first), [`last(X [, KEY])`](./aggregate/last) | The value of the first or last row, or at the least or greatest key |
| [`arg_min(X, KEY)`](./aggregate/first), [`arg_max(X, KEY)`](./aggregate/last) | The same as `first(X, KEY)` and `last(X, KEY)` |

## Numbers {#round_even}

| Function | Result |
| --- | --- |
| [`round_even(X [, DIGITS])`](./math/round_even) | Rounded with halves to even |
| [`isnan(X)`](./math/isnan) | Whether a number is NaN |

## Window functions {#ignore-nulls}

| Syntax | Result |
| --- | --- |
| [`IGNORE NULLS`](./window/#ignore-nulls) | `lag`, `lead`, `first_value`, `last_value` and `nth_value` skip NULL values |
