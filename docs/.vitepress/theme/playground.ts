// Playgrounds (BRAND.md, Documentation, rule 7): a code example a reader can run, change and share, on the page where
// it is documented. At rest a playground is the example as written and its tested result, and it loads nothing. The
// first Run loads smaltkit's editor and grid and starts the language's runner, which the site provides from its own
// copy of the engine (never a CDN). Every Run starts from the page's setup, the examples before it, in a fresh database.
//
// Two parts:
// - playgroundPlugin(): a markdown-it plugin for .vitepress/config.ts. Every tested example of a playground language
//   runs in place: at rest it is the example, a Run button and its tested result (the table printed under it, or the
//   error its `docs:error` marker names); Run or Edit turns it into a playground where it stands.
// - enablePlaygrounds(): wires the playgrounds in the browser, for .vitepress/theme/index.ts, with the site's runners.
// sqlRunner() makes a runner from a smaltdb `open()` that reads SQL, such as smaltql's.

// ---------------------------------------------------------------------------------------------------------------------
// The markdown-it plugin

export interface PlaygroundPluginOptions {
  /** The fence languages that can be playgrounds (default ['sql']). */
  languages?: string[]
  /**
   * Which examples run: 'every' tested example (the default), or only fences marked `play` (```sql play). Either way
   * a fence marked `noplay`, and examples marked `docs:skip` or `docs:plugin`, don't.
   */
  run?: 'every' | 'marked'
}

interface Token {
  type: string
  tag: string
  info: string
  content: string
  nesting: number
  block: boolean
  map: [number, number] | null
}

interface MarkdownIt {
  core: { ruler: { push(name: string, rule: (state: { tokens: Token[]; env: any; Token: new (type: string, tag: string, nesting: number) => Token }) => void): void } }
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const MARKER = /^<!--\s*(docs:[\s\S]*?)\s*-->\s*$/

/**
 * Makes examples run in place. A playground's setup is what the page's examples test runs before it: every example of
 * the same language above it, in order, and the SQL of `<!-- docs:setup … -->` markers, leaving out examples marked
 * `docs:skip` or `docs:plugin` (one marked `docs:error` is run, its last statement expected to fail). Front matter
 * `playground: false` turns a page's playgrounds off. An example marked `docs:error CODE` runs too, and its tested result is that error. In
 * .vitepress/config.ts:
 *
 *     import { playgroundPlugin } from './theme/playground'
 *     markdown: { config: (md) => md.use(playgroundPlugin) }
 */
export function playgroundPlugin(md: MarkdownIt, options: PlaygroundPluginOptions = {}): void {
  const languages = new Set(options.languages ?? ['sql'])
  const every = (options.run ?? 'every') === 'every'
  md.core.ruler.push('sw_playground', (state) => {
    const out: Token[] = []
    const setup = new Map<string, SetupStep[]>()
    // A page's front matter can turn its playgrounds off (`playground: false`): its examples need what the site doesn't load.
    const off = state.env?.frontmatter?.playground === false
    let markers: string[] = []
    let index = 0
    const html = (content: string): Token => {
      const t = new state.Token('html_block', '', 0)
      t.content = content
      return t
    }
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      if (t.type === 'html_block') {
        const m = MARKER.exec(t.content.trim())
        if (m) {
          const setupSql = /^docs:setup\s+([\s\S]*)$/.exec(m[1])
          if (setupSql) for (const lang of languages) list(setup, lang).push(setupSql[1].trim())
          else markers.push(m[1].trim())
          out.push(t)
          continue
        }
      }
      if (t.type !== 'fence') {
        if (!(t.type === 'html_block' && !t.content.trim())) markers = []
        out.push(t)
        continue
      }
      const [lang, ...flags] = t.info.trim().split(/\s+/)
      const kinds = markers.map((m) => m.split(/\s+/)[0])
      const fails = markers.find((m) => m.startsWith('docs:error'))?.split(/\s+/)[1]
      // What this site's examples test runs (an example marked docs:plugin runs in the plugin's repository).
      const tested = !kinds.includes('docs:skip') && !kinds.includes('docs:plugin')
      const runnable = tested && !off
      markers = []
      if (!languages.has(lang)) {
        out.push(t)
        continue
      }
      const before = list(setup, lang).slice()
      // The examples test runs an example marked docs:error too, and expects its last statement to fail: a failing
      // statement can still change the database (INSERT OR ROLLBACK ends the open transaction).
      if (tested) list(setup, lang).push(fails !== undefined || kinds.includes('docs:error') ? { sql: t.content.trim(), fails: true } : t.content.trim())
      if (!runnable || flags.includes('noplay') || !(every || flags.includes('play'))) {
        t.info = [lang, ...flags.filter((f) => f !== 'play' && f !== 'noplay')].join(' ')
        out.push(t)
        continue
      }
      // The fence keeps its highlighting: only its info string loses `play`.
      t.info = [lang, ...flags.filter((f) => f !== 'play')].join(' ')
      const n = index++
      out.push(
        html(
          `<div class="sw-play" id="play-${n}" data-index="${n}" data-lang="${esc(lang)}" data-code="${esc(t.content)}" data-setup="${esc(JSON.stringify(before))}"` +
            // An example the docs expect to fail: its error, when Run gives it, is the expected result.
            (kinds.includes('docs:error') ? ` data-fails="${esc(fails ?? '')}"` : '') +
            ` v-pre>\n` +
            `<div class="sw-play-code">\n`,
        ),
      )
      out.push(t)
      out.push(
        html(
          `</div>\n<div class="sw-play-bar" role="toolbar" aria-label="Playground">` +
            `<button type="button" class="sw-play-run" data-play="run" title="Run (Ctrl+Enter)">Run</button>` +
            `<button type="button" data-play="edit">Edit</button>` +
            `<button type="button" data-play="reset" hidden>Reset</button>` +
            `<button type="button" data-play="copy">Copy</button>` +
            `<button type="button" data-play="share">Share</button>` +
            `<a class="sw-play-app" data-play="app" hidden>Open in the app</a>` +
            `<span class="sw-play-status" role="status" aria-live="polite"></span></div>\n` +
            `<div class="sw-play-result" data-tested>\n` +
            (fails !== undefined ? `<p class="sw-play-fails">Fails with <code>${esc(fails)}</code></p>\n` : ''),
        ),
      )
      // The result table the examples test checks, if one follows directly.
      if (tokens[i + 1]?.type === 'table_open') {
        let j = i + 1
        while (j < tokens.length && tokens[j].type !== 'table_close') out.push(tokens[j++])
        if (j < tokens.length) out.push(tokens[j])
        i = j
      }
      out.push(html(`</div>\n</div>\n`))
    }
    state.tokens = out
  })
}

function list(map: Map<string, string[]>, key: string): string[] {
  let l = map.get(key)
  if (!l) map.set(key, (l = []))
  return l
}

// ---------------------------------------------------------------------------------------------------------------------
// Runners

/** What a Run shows: a table, or a note for statements that return no rows. */
export interface PlayResult {
  columns: string[]
  rows: unknown[][]
  /** Shown instead of a table when there are no columns, such as "3 rows changed". */
  note?: string
}

/** One example of a playground's setup: its code, and whether its last statement is expected to fail. */
export type SetupStep = string | { sql: string; fails: true }

/** Runs a playground's code after its setup. Throws an Error, with `code` when the language has one, to show it. */
export interface Runner {
  run(code: string, setup: SetupStep[]): Promise<PlayResult>
}

/** The part of a smaltdb `Database` a SQL runner uses. */
export interface SqlDatabase {
  query(sql: string, params?: unknown, options?: { rowMode: 'array' }): Promise<unknown[][] & { columns: string[] }>
  exec(sql: string): Promise<{ changes?: number }>
  close?(): unknown
}

/** Splits SQL into statements at semicolons outside strings, quoted names and comments. */
export function splitSql(text: string): string[] {
  const out: string[] = []
  let start = 0
  let i = 0
  const push = (end: number) => {
    const s = text.slice(start, end).trim()
    if (s && !/^(--[^\n]*\n?|\/\*[\s\S]*?\*\/|\s)*$/.test(s)) out.push(s)
  }
  while (i < text.length) {
    const c = text[i]
    if (c === "'" || c === '"' || c === '`' || c === '[') {
      const close = c === '[' ? ']' : c
      i++
      while (i < text.length) {
        if (text[i] === close) {
          if (close !== ']' && text[i + 1] === close) i += 2
          else break
        } else i++
      }
      i++
    } else if (c === '-' && text[i + 1] === '-') {
      while (i < text.length && text[i] !== '\n') i++
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 2
    } else if (c === ';') {
      push(i)
      start = ++i
    } else i++
  }
  push(text.length)
  return out
}

/**
 * A SQL runner that gives every Run a fresh in-memory database: the setup, then the code's statements, showing the last
 * one's rows. Nothing a Run leaves behind (tables, an open transaction, a failed statement) reaches the next, so every
 * Run starts where the examples test starts. `open` must give a new database each call, in a worker of its own (closing
 * a database ends its worker); the runner opens the next Run's database as soon as a Run starts, so it is ready by the
 * time the reader runs again, and closes each when its Run ends. In .vitepress/theme/index.ts, with the site's own
 * build of smaltql:
 *
 *     sql: sqlRunner(async () => (await import('@smaltworks/smaltql')).open('playground', { storage: 'memory' }))
 */
export function sqlRunner(open: () => Promise<SqlDatabase>): () => Promise<Runner> {
  return async () => {
    let next = open()
    await next // the first database starting is what the first Run waits for
    let queue: Promise<unknown> = Promise.resolve()
    const run = async (code: string, setup: SetupStep[]): Promise<PlayResult> => {
      const db = await next
      next = open()
      next.catch(() => undefined) // a failure shows on the Run that waits for it
      try {
        for (const step of setup) {
          const statements = splitSql(typeof step === 'string' ? step : step.sql)
          for (const [i, s] of statements.entries()) {
            if (typeof step !== 'string' && i === statements.length - 1) await db.exec(s).catch(() => undefined)
            else await db.exec(s)
          }
        }
        const statements = splitSql(code)
        if (statements.length === 0) return { columns: [], rows: [], note: 'Nothing to run' }
        for (const s of statements.slice(0, -1)) await db.exec(s)
        const r = await db.query(statements[statements.length - 1], undefined, { rowMode: 'array' })
        if (r.columns.length) return { columns: r.columns, rows: [...r] }
        return { columns: [], rows: [], note: 'Done: the last statement returns no rows' }
      } finally {
        try {
          await db.close?.()
        } catch {
          // The worker is gone either way.
        }
      }
    }
    return {
      // One Run at a time, so the databases start in order.
      run: (code, setup) => {
        const result = queue.then(() => run(code, setup))
        queue = result.catch(() => undefined)
        return result
      },
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// In the browser

export interface PlaygroundOptions {
  /** A runner for each language, started on the first Run of that language and kept for the visit. */
  runners: Record<string, () => Promise<Runner>>
  /** A link that opens the code in the app (Sites and READMEs, rule 12), or undefined for none. */
  app?: (lang: string, code: string) => string | undefined
  /** How many rows a result shows before it scrolls (default 10). */
  visibleRows?: number
}

type Editor = { value: string; focus(): void }
type Kit = {
  Editor: new (host: HTMLElement, opts: Record<string, unknown>) => Editor
  sqlLanguage: unknown
  typescriptLanguage: unknown
  Grid: new (host: HTMLElement, opts: Record<string, unknown>) => { setData(columns: string[], rows: unknown[][]): void }
}

let kit: Promise<Kit> | undefined
const runners = new Map<string, Promise<Runner>>()
const started = new Set<string>()

/** smaltkit's editor and grid, and their styles: loaded on the first Edit or Run, not before. */
function loadKit(): Promise<Kit> {
  return (kit ??= Promise.all([import('smaltkit/editor'), import('smaltkit/grid'), import('smaltkit/ui.css')]).then(
    ([e, g]) => ({ Editor: e.Editor, sqlLanguage: e.sqlLanguage, typescriptLanguage: e.typescriptLanguage, Grid: g.Grid }) as Kit,
  ))
}

const editors = new WeakMap<HTMLElement, Editor>()

/** A result grid as tall as its header and rows, up to `visible` rows, plus a horizontal scroll bar when it has one. */
function fit(box: HTMLElement, visible: number): void {
  const table = box.querySelector('table')
  const scroll = box.querySelector<HTMLElement>('.sk-grid-scroll')
  if (!table || !scroll) return
  const rows = [...table.querySelectorAll('tbody tr:not(.sk-grid-spacer)')]
  const last = rows[Math.min(visible, rows.length) - 1]
  const top = table.getBoundingClientRect().top
  const bottom = (last ?? table.querySelector('thead') ?? table).getBoundingClientRect().bottom
  const bar = scroll.offsetHeight - scroll.clientHeight
  box.style.height = `${Math.ceil(bottom - top + bar + 2)}px`
  // A scroll bar can appear once the height is set: measure once more.
  requestAnimationFrame(() => {
    const more = scroll.offsetHeight - scroll.clientHeight - bar
    if (more > 0) box.style.height = `${parseFloat(box.style.height) + more}px`
  })
}

/** The code for a share link: UTF-8, then base64url. */
export function encodeCode(code: string): string {
  let bin = ''
  for (const b of new TextEncoder().encode(code)) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeCode(text: string): string {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/**
 * Wires every playground on the page, now and after each navigation. In .vitepress/theme/index.ts:
 * `enhanceApp() { if (typeof document !== 'undefined') enablePlaygrounds({ runners: { sql: … } }) }`.
 */
export function enablePlaygrounds(options: PlaygroundOptions, doc: Document = document): void {
  const w = doc as Document & { swPlay?: boolean }
  if (w.swPlay) return
  w.swPlay = true
  const visible = options.visibleRows ?? 10

  const parts = (play: HTMLElement) => ({
    code: play.querySelector<HTMLElement>(':scope > .sw-play-code')!,
    result: play.querySelector<HTMLElement>(':scope > .sw-play-result')!,
    status: play.querySelector<HTMLElement>('.sw-play-status')!,
    reset: play.querySelector<HTMLElement>('[data-play="reset"]')!,
    edit: play.querySelector<HTMLElement>('[data-play="edit"]')!,
  })
  const tested = new WeakMap<HTMLElement, Node[]>()
  const original = (play: HTMLElement) => (play.getAttribute('data-code') ?? '').replace(/\n+$/, '')
  const current = (play: HTMLElement) => editors.get(play)?.value ?? original(play)
  const say = (play: HTMLElement, text: string) => (parts(play).status.textContent = text)

  const setupApp = (play: HTMLElement) => {
    const a = play.querySelector<HTMLAnchorElement>('[data-play="app"]')!
    const url = options.app?.(play.getAttribute('data-lang') ?? '', current(play))
    a.hidden = !url
    if (url) a.href = url
  }

  /** The example becomes an editor: smaltkit's, over the same code. */
  const edit = async (play: HTMLElement, code?: string): Promise<Editor> => {
    const have = editors.get(play)
    if (have) {
      if (code !== undefined) have.value = code
      return have
    }
    const k = await loadKit()
    const { code: host, edit: editButton, reset } = parts(play)
    if (!tested.has(play)) tested.set(play, [...parts(play).result.childNodes].map((n) => n.cloneNode(true)))
    const box = doc.createElement('div')
    box.className = 'sw-play-editor'
    host.replaceChildren(box)
    const lang = play.getAttribute('data-lang')
    const editor = new k.Editor(box, {
      value: code ?? original(play),
      language: lang === 'ts' || lang === 'typescript' ? k.typescriptLanguage : k.sqlLanguage,
      label: `${lang?.toUpperCase()} playground`,
      keys: { 'Mod+Enter': () => void run(play) },
      onChange: () => setupApp(play),
    })
    editors.set(play, editor)
    editButton.hidden = true
    reset.hidden = false
    play.classList.add('sw-play-live')
    return editor
  }

  const run = async (play: HTMLElement) => {
    const lang = play.getAttribute('data-lang') ?? ''
    const start = runners.get(lang) ?? (options.runners[lang] ? options.runners[lang]() : undefined)
    if (!start) return say(play, `No runner for ${lang}`)
    runners.set(lang, start)
    start.catch(() => runners.delete(lang))
    const editor = await edit(play)
    const { result } = parts(play)
    play.setAttribute('aria-busy', 'true')
    say(play, started.has(lang) ? 'Running…' : 'Starting the engine…')
    const t0 = performance.now()
    try {
      const runner = await start
      started.add(lang)
      say(play, 'Running…')
      const setup = JSON.parse(play.getAttribute('data-setup') ?? '[]') as SetupStep[]
      const r = await runner.run(editor.value, setup)
      const ms = Math.round(performance.now() - t0)
      result.removeAttribute('data-tested')
      result.removeAttribute('data-expected')
      if (r.columns.length) {
        const k = await loadKit()
        const box = doc.createElement('div')
        box.className = 'sw-play-grid'
        box.style.height = '120px'
        result.replaceChildren(box)
        new k.Grid(box, { emptyText: 'No rows' }).setData(r.columns, r.rows)
        fit(box, visible)
        say(play, `${r.rows.length} ${r.rows.length === 1 ? 'row' : 'rows'} · ${ms} ms`)
      } else {
        const note = doc.createElement('p')
        note.className = 'sw-play-note'
        note.textContent = r.note ?? 'Done'
        result.replaceChildren(note)
        say(play, `${ms} ms`)
      }
    } catch (e) {
      const err = e as Error & { code?: string }
      // The failure the docs show for this example (the code they name, or any error when they name none) is its
      // result, not a problem: it is marked as expected, not as an alert. Once the code is edited, it is an error again.
      const want = play.getAttribute('data-fails')
      const expected = want !== null && editor.value === original(play) && (!want || err.code === want)
      const box = doc.createElement('div')
      box.className = expected ? 'sw-play-error sw-play-expected' : 'sw-play-error'
      if (!expected) box.setAttribute('role', 'alert')
      if (err.code) {
        const code = doc.createElement('strong')
        code.textContent = err.code
        box.append(code, ' ')
      }
      box.append(err.message ?? String(e))
      result.removeAttribute('data-tested')
      result.toggleAttribute('data-expected', expected)
      result.replaceChildren(box)
      say(play, expected ? 'Failed as expected' : 'Error')
    } finally {
      play.removeAttribute('aria-busy')
    }
  }

  const reset = async (play: HTMLElement) => {
    const editor = editors.get(play)
    if (editor) editor.value = original(play)
    const { result } = parts(play)
    const saved = tested.get(play)
    if (saved) {
      result.replaceChildren(...saved.map((n) => n.cloneNode(true)))
      result.setAttribute('data-tested', '')
      result.removeAttribute('data-expected')
    }
    say(play, '')
    setupApp(play)
  }

  const copy = async (play: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(current(play))
      say(play, 'Copied')
    } catch {
      say(play, 'Copy failed: the browser blocked the clipboard')
    }
  }

  const share = async (play: HTMLElement) => {
    // The code travels in the link's fragment, which the browser never sends to a server.
    const url = new URL(doc.location.href)
    url.hash = `play-${play.getAttribute('data-index')}=${encodeCode(current(play))}`
    try {
      await navigator.clipboard.writeText(url.href)
      say(play, 'Link copied')
    } catch {
      say(play, 'Link in the address bar')
    }
    history.replaceState(history.state, '', url.href)
  }

  doc.addEventListener('click', (e) => {
    const button = (e.target as Element | null)?.closest?.('[data-play]')
    const play = button?.closest<HTMLElement>('.sw-play')
    if (!button || !play) return
    const action = button.getAttribute('data-play')
    if (action === 'app') return
    e.preventDefault()
    if (action === 'run') void run(play)
    else if (action === 'edit') void edit(play).then((ed) => ed.focus())
    else if (action === 'reset') void reset(play)
    else if (action === 'copy') void copy(play)
    else if (action === 'share') void share(play)
  })

  // A shared link opens its playground with the shared code, ready to run; nothing runs until the reader asks.
  const open = () => {
    const m = /^#play-(\d+)=([A-Za-z0-9_-]+)$/.exec(doc.location.hash)
    const play = m ? doc.getElementById(`play-${m[1]}`) : null
    if (!m || !play) return
    let code: string
    try {
      code = decodeCode(m[2])
    } catch {
      return
    }
    void edit(play, code).then(() => {
      say(play, 'Shared code: Run to see its result')
      play.scrollIntoView({ block: 'center' })
    })
  }
  const ready = () => {
    doc.querySelectorAll<HTMLElement>('.sw-play').forEach((p) => {
      p.classList.add('sw-play-ready')
      setupApp(p)
    })
    open()
  }
  // VitePress swaps the page's content on navigation: look again when it does.
  new MutationObserver(() => {
    if (doc.querySelector('.sw-play:not(.sw-play-ready)')) ready()
  }).observe(doc.body, { childList: true, subtree: true })
  ready()
}
