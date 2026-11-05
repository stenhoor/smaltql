// Builds dist/: index.js (the language: sqlLanguage, the parser, open()), register.js (registers it) and worker.js (the
// engine worker open() starts), sharing chunks so all hold the same sqlLanguage, and their declarations. smaltdb is never bundled: `smaltdb/language` stays an import.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

rmSync('dist', { recursive: true, force: true });
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
await build({
  entryPoints: ['src/index.ts', 'src/register.ts', 'src/worker.ts'],
  outdir: 'dist',
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  sourcemap: true,
  external: ['smaltdb', 'smaltdb/*'],
  logLevel: 'warning',
});
// Declarations are checked against smaltdb's published types (node_modules/smaltdb), not its source.
writeFileSync(
  'tsconfig.build.json',
  JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: { noEmit: false, declaration: true, emitDeclarationOnly: true, outDir: 'dist', rootDir: 'src', paths: {} },
    include: ['src'],
  }),
);
try {
  const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], { stdio: 'inherit' });
} finally {
  rmSync('tsconfig.build.json');
}
console.log(`built ${pkg.name}`);
