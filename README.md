<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/stenhoor/smalt-brand/main/logos/smaltql/lockup-on-dark.svg">
    <img alt="smaltql" src="https://raw.githubusercontent.com/stenhoor/smalt-brand/main/logos/smaltql/lockup.svg" width="320">
  </picture>
</h1>

**Small. Alternative. Familiar.**

The SQL you know, for [smaltdb](https://github.com/stenhoor/smaltdb).

smaltql is smaltdb's SQL: the language you query the engine with, in a dialect that follows SQLite. It builds plans
for the engine's shared plan layer, the same layer [smaltdf](https://github.com/stenhoor/smaltdf) uses, so SQL and
dataframes get the same optimizer and the same storage. smaltdb ships with smaltql by default.

- **Familiar SQL always works.** smaltql can add syntax of its own, but only on top of SQL. It never changes what
  working SQL means.
- **A client of the plan API.** smaltql reaches the engine only through smaltdb's public plan API, like any other
  language.

> **Status: planned.** SQL works today inside smaltdb. It moves to this repository after the last steps of smaltdb's
> plan layer
> ([smaltdb ADR 0015](https://github.com/stenhoor/smaltdb/blob/main/docs/adr/0015-smaltql.md), proposed). When it
> publishes, the package is `@smaltworks/smaltql`.

Part of [smaltworks](https://smaltworks.dev).

## Licence

MIT. See [LICENSE](LICENSE).
