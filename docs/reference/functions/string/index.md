# String functions

Functions that build, measure, search and format text. The concatenation operator `||` and pattern matching with `LIKE` and `GLOB` are operators, documented in [Expressions](../../sql/expressions).

Unless stated otherwise, a NULL argument gives a NULL result, and numbers are converted to text the way `CAST(x AS TEXT)` converts them. Lengths and positions count characters (Unicode code points), not bytes or UTF-16 units.

## Functions {#functions}

### Measuring text

- [`length`](./length): The number of characters in text, or of bytes in a blob.
- [`octet_length`](./octet_length): The number of bytes in the UTF-8 encoding of `X` (for a blob, its size).

### Case

- [`lower`](./lower): `X` as text with the ASCII letters `A`–`Z` changed to lower case.
- [`upper`](./upper): `X` as text with the ASCII letters `a`–`z` changed to upper case.
- [`lower_unicode`](./lower_unicode): `X` in lower case, in every script: `lower` changes only ASCII letters.
- [`upper_unicode`](./upper_unicode): `X` in upper case, in every script: `upper` changes only ASCII letters.

### Substrings

- [`substr`](./substr): The part of `X` that begins at character `START` and is `LENGTH` characters long. `substring` is the same function.
- [`instr`](./instr): The position (1-based, in characters) of the first occurrence of `Y` in `X`, or 0 when `Y` does not occur.

### Trimming and replacing

- [`trim`](./trim): Removes characters from both ends of `X`.
- [`ltrim`](./ltrim): Like `trim`, but only from the start of `X`.
- [`rtrim`](./rtrim): Like `trim`, but only from the end of `X`.
- [`replace`](./replace): `X` with every occurrence of `Y` replaced by `Z`.

### Concatenation

- [`concat`](./concat): Concatenates the text form of all its arguments, skipping NULLs.
- [`concat_ws`](./concat_ws): Concatenates the non-NULL arguments after the first, with `SEP` between them.

### Characters and code points

- [`char`](./char): A string made of the characters whose Unicode code points are the arguments.
- [`unicode`](./unicode): The Unicode code point of the first character of `X` (as text).

### Hex and SQL literals

- [`hex`](./hex): The bytes of `X` as upper-case hexadecimal.
- [`quote`](./quote): `X` as an SQL literal: text in single quotes with embedded quotes doubled, blobs as `X'…'`, NULL as the text `NULL`, and numbers in a form that reads back as the same value (a REAL keeps a decimal point or exponent).

### Formatting

- [`printf`](./printf): `FORMAT` with each `%` conversion replaced by the next argument, as SQLite formats it. `format` is the same function.
