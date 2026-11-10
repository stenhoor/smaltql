# Math functions

Numeric functions: absolute values, rounding, signs and random numbers, and SQLite's math functions (rounding to an integer, powers, logarithms, angles, trigonometry and hyperbolic functions).

Arithmetic (`+ - * / %`) and the bitwise operators are documented in [Expressions](../../sql/expressions); [`min` and `max`](../scalar/min) with several arguments are on the scalar page.

## Functions {#functions}

### Signs, rounding and random numbers

- [`abs`](./abs): The absolute value of `X`.
- [`round`](./round): `X` rounded to `DIGITS` digits after the decimal point (default 0).
- [`round_even`](./round_even): `X` rounded to `DIGITS` places after the point (default 0), with a half rounded to the even digit: `2.5` gives `2`, `3.5` gives `4`.
- [`sign`](./sign): `-1`, `0` or `1` for a negative, zero or positive number.
- [`random`](./random): A pseudo-random 64-bit signed integer, between -9223372036854775808 and 9223372036854775807, from `crypto.getRandomValues`.
- [`isnan`](./isnan): 1 when `X` is NaN, else 0.

### Rounding to an integer

- [`ceil`](./ceil): The smallest integer not less than `X`. `ceiling` is the same function.
- [`floor`](./floor): The largest integer not greater than `X`.
- [`trunc`](./trunc): `X` with its fractional part dropped, rounding toward zero.

### Powers and roots

- [`sqrt`](./sqrt): The square root of `X`.
- [`pow`](./pow): `X` raised to the power `Y`. `power` is the same function.
- [`exp`](./exp): *e* raised to the power `X`.

### Logarithms

- [`ln`](./ln): The natural logarithm of `X`.
- [`log`](./log): The base-10 logarithm of `X`; with two arguments, the base-`B` logarithm of `X`.
- [`log10`](./log10): The base-10 logarithm of `X`.
- [`log2`](./log2): The base-2 logarithm of `X`.

### Remainder

- [`mod`](./mod): The remainder of `X` divided by `Y`, with the sign of `X`, as a REAL.

### Angles

- [`pi`](./pi): The number π.
- [`degrees`](./degrees): The angle `X`, in radians, in degrees.
- [`radians`](./radians): The angle `X`, in degrees, in radians.

### Trigonometry

- [`sin`](./sin): The sine of the angle `X`, in radians.
- [`cos`](./cos): The cosine of the angle `X`, in radians.
- [`tan`](./tan): The tangent of the angle `X`, in radians.
- [`asin`](./asin): The arcsine of `X`: the angle, in radians, whose sine is `X`.
- [`acos`](./acos): The arccosine of `X`: the angle, in radians, whose cosine is `X`.
- [`atan`](./atan): The arctangent of `X`: the angle, in radians, whose tangent is `X`.
- [`atan2`](./atan2): The angle of the point (`X`, `Y`) from the positive x-axis, in radians, from -π to π.

### Hyperbolic functions

- [`sinh`](./sinh): The hyperbolic sine of `X`.
- [`cosh`](./cosh): The hyperbolic cosine of `X`.
- [`tanh`](./tanh): The hyperbolic tangent of `X`.
- [`asinh`](./asinh): The inverse hyperbolic sine of `X`.
- [`acosh`](./acosh): The inverse hyperbolic cosine of `X`.
- [`atanh`](./atanh): The inverse hyperbolic tangent of `X`.

## Arguments and results of the math functions {#math-arguments}

The math functions (all of the table above) follow SQLite, which builds them into its official releases:
- **Arguments** are used when they are numbers: INTEGER, REAL, or text that is a number, with optional spaces around it (`'16'`, `' 2.25 '`). Other text, blobs and NULL give NULL.
- **Results** are REAL, except that [`ceil`, `floor` and `trunc`](./ceil) return an INTEGER argument unchanged.
- **Undefined results are NULL:** the square root of a negative number, the logarithm of zero or a negative number, `acos(2)`, `mod(x, 0)`.
- **Overflow gives infinity**, which is a REAL and turns into the text `Inf` (`-Inf`), as in SQLite.

```sql
SELECT sqrt('16') AS a, sqrt(' 2.25 ') AS b, sqrt('x') AS c, sqrt(x'34') AS d, sqrt(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| 4 | 1.5 | NULL | NULL | NULL |

```sql
SELECT exp(1000) > 1e308 AS a, typeof(exp(1000)) AS b, CAST(exp(1000) AS TEXT) AS c;
```

| a | b | c |
| --- | --- | --- |
| 1 | real | Inf |

**Accuracy.** `sqrt`, `ceil`, `floor`, `trunc`, `mod`, `degrees` and `radians` are exact. The other functions come from JavaScript's `Math` (`tanh` and `log10` from ports of the C library's): in V8 (Chrome, Edge, Node) they are within one unit in the last place of SQLite's results, and most match to the last bit. JavaScript does not fix the last bit, so another browser's engine can differ there; round results you compare or display. See [Differences from SQLite](../../../guide/sqlite-differences#math-functions).

**Speed.** On numeric columns, the math functions are compiled into the query like arithmetic, in row and columnar tables and in aggregates, so `sum(sqrt(x))` costs about the same as `sum(x * x)`.
