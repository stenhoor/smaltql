# CLAUDE.md

This repository is `smaltql`, SQL for [smaltdb](https://github.com/stenhoor/smaltdb), the embedded database engine for
browsers: the SQLite dialect, parsed and bound to smaltdb plans. It is a language in smaltdb's terms (ADR 0015 in
smaltdb): it registers with the engine (`registerLanguage`) and reaches it only through `smaltdb/language`. Several
Claude Code sessions work on the smalt repos in parallel and cannot see each other: this file is the shared starting
point, and its working rules match smaltdb's `CLAUDE.md`.

## Brand: read smalt-brand first

Before changing this repository's site, README, or how it describes the product, read smalt-brand's
[BRAND.md](https://github.com/stenhoor/smalt-brand/blob/main/BRAND.md) (the family table, and "Sites and READMEs", the
standard every product site and README follows) and
[DECISIONS.md](https://github.com/stenhoor/smalt-brand/blob/main/DECISIONS.md). A newer decision there wins over any
copy here: lines and roles change, and a copy taken before the change is out of date.

- Copy brand files and the site kit (`themes/vitepress/`) unchanged. To change them, change smalt-brand first, then
  copy them again.
- A change to this product's status or to what it does comes with a smalt-brand PR that updates smaltworks.dev (its
  status page and this product's page), linked with `Depends on:`.

## Commands

| Command | What it does | When |
|---|---|---|
| `npm ci && npm run deps` | Installs dependencies, then the pinned smaltdb build in `packed.json` (see below) | First, and again after every `npm ci` or `npm install` |
| `npm run check` | `npm run typecheck` then `npm test` (vitest): what CI's `test` job runs | Before every commit |
| `npm run slt` | The sqllogictest subset (122k records), downloaded into `.cache/slt` on first use | Changes to the parser, the binder or anything SQL means |
| `npm run build` | `dist/`: `index.js` (the language, parser and `open()`), `register.js`, `worker.js` and type declarations | Packaging checks |
| `npm run docs:dev` | The docs site (VitePress) with live reload; `npm run docs:build` fails on dead links | Docs changes |

Type checking (`npm run typecheck`, and the docs examples' check in `test/docs-examples.test.ts`) runs on TypeScript 7:
`typescript7`, an npm alias, run as `node node_modules/typescript7/bin/tsc`. The declarations `npm run build` emits stay
on TypeScript 6.0.3 (`typescript`, so `npx tsc` is 6.0.3) for one more release (smaltty ADR 0030).

## Before the first publish

smaltdb 0.9.0 is not on npm yet. `packed.json` pins it to a commit; `scripts/fetch-packed.mjs` builds that commit, packs
it and installs the tarball with `npm install --no-save`, so it never reaches `package.json` or the lockfile. To try an
unmerged smaltdb change, run `node scripts/fetch-packed.mjs --local smaltdb=../smaltdb`. The script is identical in
every repository that uses it.

Tests run smaltdb from the source in its packed build (`node_modules/smaltdb/src`), and may import its internals as
`smaltdb-src/...`. The language's own code imports only `smaltdb/language`; `npm run build` checks its declarations
against smaltdb's published types.

## Rules for this repository

- `src/` imports nothing of smaltdb but `smaltdb/language` (types and values). Anything else a language needs is added
  to `smaltdb/language` in smaltdb first, then the pin here is updated.
- smaltdb's engine carries no language, so tests register smaltql's (`test/setup.ts`), and `test/language.test.ts`
  checks that it is the one databases read.
- SQL results must match SQLite: `npm run slt` stays at smaltdb's pass rate.
- **Docs examples are tests.** `test/docs-examples.test.ts` runs every SQL example in `docs/guide` and `docs/reference`
  (with the plugins pinned in `packed.json`), checks the result tables printed under them, and type-checks the
  TypeScript ones. Parquet examples are marked `<!-- docs:plugin @smaltdb/parquet -->` and run in `smaltdb-parquet`.
- The docs site deploys from `main` to GitHub Pages (`.github/workflows/docs.yml`), at `/smaltql/` until it has a domain
  (`DOCS_BASE` in `docs/.vitepress/config.ts`). Engine, plugin and error-code pages live on smaltdb.dev: link there.
- Don't reformat files with Prettier. No fixed sleeps in tests.

## Working rules for sessions

- One task per branch and PR. Do not add unrelated work to an open PR: it holds up everything else in it.
- Mark unfinished work clearly, and open a PR only when CI passes.
- Read review comments on your PR and answer them with commits that say what they address.
- When a PR depends on another repo's PR, add a line such as `Depends on: stenhoor/smalt-brand#2`.
- **Ask before adding outside code.** Ask the owner, and wait for a yes, before adding a package (a dependency of any
  kind, or a pin in `packed.json`), copying or bundling in someone else's code, or loading code from another site at run
  time (a CDN such as jsDelivr). Say what it is, its licence and size, what it's for, and why our own code can't do it.
  Outside code that a feature needs goes in a plugin, so it is named and optional, never in core.

## Issues

The owner (`stenhoor`) assigns work by opening GitHub issues. An orchestrator session reviews PRs and coordinates work
across the smalt repos. Sessions don't monitor issues: no scheduled or recurring issue checks. A session works on an
issue when the owner points it to one. Handle that issue in the issue itself, so its status is visible there:

- **Who wrote it:** everyone posts as `stenhoor`. Every session comment ends with the footer
  `_Generated by [Claude Code](https://claude.ai/code)_`, and the orchestrator's also start with `**Orchestrator:**`.
  A comment without the footer is the owner's.
- **The orchestrator:** act on its reviews and coordination. It relays decisions only the owner can make as
  "Owner decided".
- **Pick it up:** comment with the plan and add the `in progress` label.
- **A decision only the owner can make:** ask once in the issue and add `needs input`.
- **Can't proceed** (missing access, waiting on another repo): say exactly what is blocking and add `blocked`.
- **Work:** one task per PR, with `Refs #N` in its description and no closing keywords in commit messages. Comment on
  the issue with the PR link and what was and wasn't tested. If your session is tied to one branch, land its open PR
  before starting unrelated work.
- **Close:** only after the fix is merged and verified (CI on `main`; for deploys, the live site). Comment with the
  evidence, remove the status labels and close it. Reopen it if the problem comes back.
- Issues from anyone else are reported to the owner, not acted on.

## Cross-repo impact

- smaltdb pins this repository for its own tests (its `packed.json`). A change here that
  smaltdb's tests rely on needs the pin there updated.
- smaltui and smaltbi will import `open()` from smaltql (ADR 0015 step 9).
- `smaltdb-parquet` runs this repository's Parquet docs examples from its `smaltql` pin: after a docs change that touches
  them, update that pin.
- Brand assets and voice come from `stenhoor/smalt-brand`.
