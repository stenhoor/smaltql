# typeof

```ebnf
typeof ::= 'typeof' '(' X ')'
```

Returns the storage class of `X` as lower-case text: `'null'`, `'integer'`, `'real'`, `'text'` or `'blob'`.

```sql
SELECT typeof(1) AS a, typeof(1.5) AS b, typeof('x') AS c, typeof(x'00') AS d, typeof(NULL) AS e;
```

| a | b | c | d | e |
| --- | --- | --- | --- | --- |
| integer | real | text | blob | null |

::: warning Differs from SQLite
A REAL with no fractional part (and magnitude below 2^53) that reaches `typeof` through an untyped expression, or from an `ANY` or `NUMERIC` column, can report `'integer'`. For example `typeof(max(1, 2.0))` is `'integer'` in smaltdb and `'real'` in SQLite. A REAL literal such as `2.0` and values from a `REAL` column report `'real'`. See [Types](../../sql/types).
:::

```sql
SELECT typeof(2.0) AS literal, typeof(max(1, 2.0)) AS computed;
```

| literal | computed |
| --- | --- |
| real | integer |
