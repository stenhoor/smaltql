import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tests run smaltdb from the source in its packed build (node_modules/smaltdb/src, installed by
// scripts/fetch-packed.mjs), so tests can also reach its internals as `smaltdb-src/...` with one copy of every class.
const core = (path: string): string => fileURLToPath(new URL(`./node_modules/smaltdb/src/${path}`, import.meta.url));

// smaltdb_version() returns smaltdb's package version, which smaltdb's build injects (scripts/build.mjs there).
const { version } = JSON.parse(readFileSync(core('../package.json'), 'utf8')) as { version: string };

export default defineConfig({
  define: { __SMALTDB_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: [
      { find: /^smaltdb$/, replacement: core('client/index.ts') },
      { find: /^smaltdb\/engine$/, replacement: core('engine/index.ts') },
      { find: /^smaltdb\/language$/, replacement: core('engine/language-support.ts') },
      { find: /^smaltdb\/worker-runtime$/, replacement: core('engine/worker-runtime.ts') },
      { find: /^smaltdb-src\/(.*)\.js$/, replacement: core('$1.ts') },
    ],
  },
  server: { deps: { inline: [/node_modules\/smaltdb\//] } },
  test: { include: ['test/**/*.test.ts'], setupFiles: ['test/setup.ts'] },
});
