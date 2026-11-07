/**
 * Dates and times in SQL (smaltdb ADR 0019, decision 4): SQL keeps SQLite's text world. A date or time column that
 * another language (or a Parquet file) gives reads as its result text: in results, in SQLite's date functions, in
 * arithmetic and everything else. Comparisons stay on the values where that gives what the text gives: two columns of
 * the same type, or a column and a text literal in the result format.
 */
import { describe, expect, it } from 'vitest';
import { Database, plan as p } from 'smaltdb/engine';
import type { BindContext } from 'smaltdb/language';
import { printPlan } from 'smaltdb-src/engine/plan/print.js';
import type { SelectStmt } from '../src/ast.js';
import { toPlan } from '../src/frontend/select.js';
import { parseOne } from '../src/parser.js';

const DAY = 86_400_000_000;
const days = (iso: string) => Date.parse(iso + 'T00:00:00Z') / 86_400_000;
const us = (iso: string) => Date.parse(iso.replace(' ', 'T') + 'Z') * 1000;

/** A table `ev(id INTEGER, d DATE, ts DATETIME, t TIME)` with temporal storage, as a plan defines it. */
function eventsDb(): Database {
  const db = Database.openMemory();
  const col = (name: string, type: string) => ({ name, declaredType: type, type, notNull: false, collation: 'binary' });
  db.queryPlan({
    kind: 'schema',
    op: { op: 'createTable', table: { name: 'ev', columns: [col('id', 'INTEGER'), col('d', 'DATE'), col('ts', 'DATETIME'), col('t', 'TIME')], keys: [], checks: [], foreignKeys: [], storage: 'row' }, temp: false, ifNotExists: false },
  } as never);
  const data = p.fromColumns(
    [
      [1, 2, 3, 4],
      [days('2026-11-07'), days('2026-01-31'), days('1999-12-31'), null],
      [us('2026-11-07 12:30:00'), us('2026-01-31 00:00:00') + 500_000, us('1999-12-31 23:59:59'), null],
      [12.5 * 3_600_000_000, 0, DAY - 1, null],
    ] as never,
    ['int', 'date', 'datetime', 'time'],
  );
  db.queryPlan({ kind: 'write', plan: p.append('ev', data, [0, 1, 2, 3]) });
  return db;
}

describe('dates and times in SQL', () => {
  it('read as their text', () => {
    const db = eventsDb();
    const st = db.prepare('SELECT d, ts, t FROM ev ORDER BY id');
    expect(st.all()).toEqual([
      ['2026-11-07', '2026-11-07 12:30:00', '12:30:00'],
      ['2026-01-31', '2026-01-31 00:00:00.500', '00:00:00'],
      ['1999-12-31', '1999-12-31 23:59:59', '23:59:59.999999'],
      [null, null, null],
    ]);
    expect(st.columnTypes).toEqual(['text', 'text', 'text']);
    expect(db.query('SELECT typeof(d), length(ts), d || \'!\', upper(t) FROM ev WHERE id = 1').rows).toEqual([['text', 19, '2026-11-07!', '12:30:00']]);
  });

  it("SQLite's date functions read the text", () => {
    const db = eventsDb();
    expect(db.query("SELECT date(d, '+1 month'), strftime('%Y', ts), julianday(d) - julianday('2026-11-01'), time(t, '+1 hour') FROM ev WHERE id = 1").rows).toEqual([['2026-12-07', '2026', 6, '13:30:00']]);
  });

  it('arithmetic, CAST and aggregates see the text, as SQLite would', () => {
    const db = eventsDb();
    // '2026-11-07' + 1 is 2027: the numeric prefix of the text.
    expect(db.query('SELECT d + 1, CAST(d AS INTEGER), CAST(ts AS TEXT) FROM ev WHERE id = 1').rows).toEqual([[2027, 2026, '2026-11-07 12:30:00']]);
    expect(db.query('SELECT min(d), max(ts), count(t), group_concat(d) FROM (SELECT * FROM ev ORDER BY id)').rows).toEqual([['1999-12-31', '2026-11-07 12:30:00', 3, '2026-11-07,2026-01-31,1999-12-31']]);
    expect(db.query('SELECT d, count(*) FROM ev GROUP BY d ORDER BY d').rows).toEqual([[null, 1], ['1999-12-31', 1], ['2026-01-31', 1], ['2026-11-07', 1]]);
  });

  it('compare with text as their text does', () => {
    const db = eventsDb();
    const ids = (where: string, params: unknown[] = []) => db.query(`SELECT id FROM ev WHERE ${where} ORDER BY id`, params as never).rows.map((r) => r[0]);
    // Literals in the result format: compared as values.
    expect(ids("d > '2026-01-01'")).toEqual([1, 2]);
    expect(ids("d = '2026-11-07'")).toEqual([1]);
    expect(ids("'2000-01-01' > d")).toEqual([3]);
    expect(ids("ts >= '2026-01-31 00:00:00.500'")).toEqual([1, 2]);
    expect(ids("t < '12:00:00'")).toEqual([2]);
    expect(ids("d BETWEEN '2026-01-01' AND '2026-12-31'")).toEqual([1, 2]);
    // Other text: compared as text, as SQLite compares it.
    expect(ids("ts > '2026-11-07'")).toEqual([1]);
    expect(ids("ts = '2026-01-31 00:00:00.5'")).toEqual([]);
    expect(ids("d < '2026-11-07 10:00'")).toEqual([1, 2, 3]);
    expect(ids("d = 'soon'")).toEqual([]);
    expect(ids('d = ?', ['2026-01-31'])).toEqual([2]);
    expect(ids("d IN ('2026-11-07', '1999-12-31')")).toEqual([1, 3]);
    expect(ids("d LIKE '2026-%'")).toEqual([1, 2]);
    // A number is less than any text, as in SQLite.
    expect(ids('d > 5')).toEqual([1, 2, 3]);
  });

  it('two columns of the same type compare as values; of different types, as text', () => {
    const db = eventsDb();
    expect(db.query('SELECT a.id, b.id FROM ev a JOIN ev b ON a.d < b.d ORDER BY 1, 2').rows).toEqual([[2, 1], [3, 1], [3, 2]]);
    // '2026-11-07' < '2026-11-07 12:30:00' as text.
    expect(db.query('SELECT id FROM ev WHERE d < ts ORDER BY id').rows).toEqual([[1], [2], [3]]);
  });

  it('a comparison with a literal in the result format is on the values', () => {
    const db = eventsDb();
    const ctx = (db as unknown as { bindContext(): BindContext }).bindContext();
    const text = (sql: string) => printPlan(toPlan(parseOne(sql).stmt as SelectStmt, sql, ctx)!.plan);
    expect(text("SELECT id FROM ev WHERE d > '2026-01-01'")).toMatch(/cmp_gt\(#\d+(\.\d+)?( date)?, cast_date\('2026-01-01'\)/);
    expect(text("SELECT id FROM ev WHERE d < '2026-11-07 10:00'")).toMatch(/cast_text/);
  });
});
