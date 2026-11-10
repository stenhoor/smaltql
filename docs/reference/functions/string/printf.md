# printf

```ebnf
printf ::= ('printf' | 'format') '(' (FORMAT (',' ARG)*)? ')'
```

`format` is another name for `printf`. Returns `FORMAT` with each `%` conversion replaced by the next argument, formatted like SQLite's `printf()` (a port of SQLite's formatter, so the output is the same, byte for byte). If `FORMAT` is NULL, or there are no arguments at all, the result is NULL. A missing argument counts as NULL (0 for numbers, empty for strings); extra arguments are ignored.

A conversion is `%[flags][width][.precision]type`. `width` and `precision` may be `*` to take them from the next argument; a negative `*` width left-aligns. `l` and `ll` before the type are accepted and ignored. A `%` followed by anything that is not a conversion (`%y`, `%hd`, `%5` at the end) ends the output there: `printf('a%yb')` is `'a'`. A `%` that is the last character is copied.

| Type | Output |
| --- | --- |
| `d`, `i` | Signed integer. A REAL is truncated; text uses its leading integer (`'12abc'` is 12, `'1e3'` is 1). |
| `u` | The integer as an unsigned 64-bit value: `printf('%u', -5)` is `18446744073709551611`. |
| `f` | Fixed-point decimal; precision is the digits after the point (default 6). |
| `e`, `E` | Exponent form, e.g. `1.23e+03`. |
| `g`, `G` | `%e` when the exponent is below -4 or not below the precision, otherwise `%f`; precision is significant digits (default 6); trailing zeros are removed. |
| `x`, `X`, `o` | Hexadecimal (lower or upper case) or octal, of the integer as an unsigned 64-bit value. |
| `c` | The first character of the argument's text; with a precision, that character repeated that many times. The width counts characters. |
| `s`, `z` | The argument as text; precision limits its length. NULL gives an empty string. |
| `q` | The text with single quotes doubled. NULL gives `(NULL)`. |
| `Q` | Like `q`, wrapped in single quotes. NULL gives `NULL` without quotes. |
| `w` | The text with double quotes doubled (for identifiers). NULL gives `(NULL)`. |
| `%` | A literal `%`. |

| Flag | Effect |
| --- | --- |
| `-` | Left-align within the width. |
| `+` | Always print a sign for signed numbers. |
| space | Print a space in place of a `+` sign. |
| `0` | Pad numbers with zeros to the width. |
| `,` | Thousands separators for `%d` / `%i` / `%u`, and for the integer part of `%f` / `%g`. |
| `#` | Keep trailing zeros for `%g` / `%G`; always print the decimal point for `%f` / `%e`; prefix `0x` / `0X` / `0` for `%x` / `%X` / `%o`. |
| `!` | Widths and precisions of `%s`, `%z`, `%q`, `%Q`, `%w` count characters instead of bytes. For numbers: up to 20 significant digits instead of 16, `%f` and `%e` drop trailing zeros, and a whole number keeps `.0` (`printf('%!g', 2)` and `printf('%!.3f', 2)` are `2.0`). |

Without `!`, widths and precisions count UTF-8 bytes, as in SQLite: `printf('%5s|', 'é')` pads to five bytes, giving three spaces. Floating-point values are rounded to 16 significant digits (20 with `!`), so `printf('%.20f', 0.1)` ends in zeros.

```sql
SELECT printf('%d|%5d|%-5d|%05d|%+d|%,d', 42, 42, 42, 42, 42, 1234567) AS ints;
```

| ints |
| --- |
| 42\|   42\|42   \|00042\|+42\|1,234,567 |

```sql
SELECT printf('%.2f', 3.14159) AS a, printf('%e', 31415.9) AS b, printf('%g', 0.0001) AS c, printf('%x', 255) AS d, printf('%.3s', 'hello') AS e, printf('%g', 1000000) AS f, printf('%u', -1) AS g;
```

| a | b | c | d | e | f | g |
| --- | --- | --- | --- | --- | --- | --- |
| 3.14 | 3.141590e+04 | 0.0001 | ff | hel | 1e+06 | 18446744073709551615 |

`%q` and `%Q` build SQL text safely:

```sql
SELECT printf('SELECT * FROM t WHERE name = %Q', 'O''Brien') AS sql;
```

| sql |
| --- |
| SELECT * FROM t WHERE name = 'O''Brien' |
