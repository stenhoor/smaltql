import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { smaltLight, smaltDark } from './theme/shiki'

const here = path.dirname(fileURLToPath(import.meta.url))
const REPO = 'https://github.com/stenhoor/smaltql'
// Served at stenhoor.github.io/smaltql/ until the site has a domain of its own: then DOCS_BASE is '/'.
const base = process.env.DOCS_BASE ?? '/smaltql/'
const ENGINE = 'https://smaltdb.dev'

export default defineConfig({
  title: 'smaltql',
  description: 'SQL for smaltdb, a fast alternative database for the browser, written in TypeScript.',
  base,
  cleanUrls: true,
  srcExclude: ['brand/**'],
  lastUpdated: false,
  // docs/brand holds the logo files; serve them from the site root.
  vite: { publicDir: path.resolve(here, '../brand') },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon-32.svg` }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&family=Martian+Mono:wght@400;600&display=swap' }],
  ],
  markdown: {
    theme: { light: smaltLight, dark: smaltDark },
    config(md) {
      // Links that leave docs/ (benchmark results, test sources) point at the file on GitHub.
      const fallback = md.renderer.rules.link_open ?? ((t, i, o, _e, s) => s.renderToken(t, i, o))
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet('href')
        if (href && !/^[a-z]+:|^#|^\//i.test(href) && env?.relativePath) {
          const target = path.posix.normalize(path.posix.join(path.posix.dirname(env.relativePath), href))
          if (target.startsWith('../')) {
            tokens[idx].attrSet('href', `${REPO}/blob/HEAD/${target.slice(3)}`)
            tokens[idx].attrSet('target', '_blank')
            tokens[idx].attrSet('rel', 'noreferrer')
          }
        }
        return fallback(tokens, idx, options, env, self)
      }
    },
  },
  themeConfig: {
    logo: { light: '/lockup.svg', dark: '/lockup-on-dark.svg', alt: 'smaltql' },
    siteTitle: false,
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'SQL', link: '/reference/sql/' },
      { text: 'Functions', link: '/reference/functions/' },
      { text: 'API', link: '/reference/api/client' },
      { text: 'FAQ', link: '/guide/faq' },
      {
        text: 'smaltdb',
        items: [
          { text: 'The engine', link: `${ENGINE}/reference/engine/` },
          { text: 'Engine API', link: `${ENGINE}/reference/api/engine` },
          { text: 'Writing plugins', link: `${ENGINE}/reference/api/plugins` },
          { text: 'Error codes', link: `${ENGINE}/reference/api/errors` },
          { text: 'Architecture', link: `${ENGINE}/ARCHITECTURE` },
        ],
      },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Installation', link: '/guide/getting-started' },
          { text: 'Quick start', link: '/guide/quick-start' },
          { text: 'FAQ', link: '/guide/faq' },
        ],
      },
      {
        text: 'User guide',
        items: [
          { text: 'Databases', link: '/guide/databases' },
          { text: 'Queries', link: '/guide/queries' },
          { text: 'Transactions', link: '/guide/transactions' },
          { text: 'Tables and schema', link: '/guide/schema' },
          { text: 'Indexes and performance', link: '/guide/indexes-and-performance' },
          { text: 'Views and materialized views', link: '/guide/views-and-materialized-views' },
          { text: 'Analytics', link: '/guide/analytics' },
          { text: 'Import and export', link: '/guide/import-export' },
          { text: 'External data', link: '/guide/external-data' },
          { text: 'Plugins', link: '/guide/plugins' },
          { text: 'Introspection', link: '/guide/introspection' },
          { text: 'Errors', link: '/guide/errors' },
          { text: 'Differences from SQLite', link: '/guide/sqlite-differences' },
        ],
      },
      {
        text: 'SQL reference',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/reference/sql/' },
          { text: 'SELECT', link: '/reference/sql/select' },
          { text: 'INSERT', link: '/reference/sql/insert' },
          { text: 'UPDATE', link: '/reference/sql/update' },
          { text: 'DELETE', link: '/reference/sql/delete' },
          { text: 'CREATE TABLE', link: '/reference/sql/create-table' },
          { text: 'ALTER TABLE', link: '/reference/sql/alter-table' },
          { text: 'DROP', link: '/reference/sql/drop' },
          { text: 'CREATE INDEX', link: '/reference/sql/create-index' },
          { text: 'Views', link: '/reference/sql/views' },
          { text: 'External tables', link: '/reference/sql/external' },
          { text: 'Transactions', link: '/reference/sql/transactions' },
          { text: 'EXPLAIN and ANALYZE', link: '/reference/sql/explain' },
          { text: 'PRAGMA', link: '/reference/sql/pragmas' },
          { text: 'Expressions', link: '/reference/sql/expressions' },
          { text: 'Data types', link: '/reference/sql/types' },
          { text: 'information_schema', link: '/reference/sql/information-schema' },
        ],
      },
      {
        text: 'Functions',
        collapsed: true,
        items: [
          { text: 'All functions', link: '/reference/functions/' },
          { text: 'Scalar', link: '/reference/functions/scalar' },
          { text: 'String', link: '/reference/functions/string' },
          { text: 'Math', link: '/reference/functions/math' },
          { text: 'Date and time', link: '/reference/functions/datetime' },
          { text: 'Aggregate', link: '/reference/functions/aggregate' },
          { text: 'Window', link: '/reference/functions/window' },
          { text: 'Table-valued', link: '/reference/functions/table-valued' },
        ],
      },
      {
        text: 'API reference',
        collapsed: true,
        items: [
          { text: 'Client (open, Database)', link: '/reference/api/client' },
          { text: 'Engine (smaltdb.dev)', link: `${ENGINE}/reference/api/engine` },
          { text: 'Writing plugins (smaltdb.dev)', link: `${ENGINE}/reference/api/plugins` },
          { text: 'Error codes (smaltdb.dev)', link: `${ENGINE}/reference/api/errors` },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: REPO }],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    footer: { message: 'MIT License', copyright: 'smaltql' },
  },
})
