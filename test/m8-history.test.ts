// smaltdb ADR 0033 step 6a: SQL reads the past. `CREATE TABLE … WITH (history = …)` keeps a table's versions, and
// `FROM t FOR SYSTEM_TIME AS OF [COMMIT | TRANSACTION | TIMESTAMP] expr` reads it as a commit left it, or at a time.
import { describe, expect, it, vi } from 'vitest';
import { Database } from 'smaltdb/engine';

/** A history table with three commits of its own: [c1, c2, c3]. */
function fresh(history = 'true'): { db: Database; c: number[] } {
  const db = Database.openMemory();
  db.exec(`CREATE TABLE t(id INTEGER PRIMARY KEY, v TEXT) WITH (history = ${history})`);
  const c: number[] = [];
  for (const sql of ["INSERT INTO t VALUES (1, 'a'), (2, 'x')", "UPDATE t SET v = 'b' WHERE id = 1", 'DELETE FROM t WHERE id = 2']) {
    db.exec(sql);
    c.push(db.pager.commitId);
  }
  return { db, c };
}
const rows = (db: Database, sql: string, params?: unknown[]) => db.query(sql, params as never).rows;

describe('CREATE TABLE … WITH (history = …)', () => {
  it.each([
    ['true', 'versions'],
    ["'on'", 'versions'],
    ["'versions'", 'versions'],
    ["'log'", 'log'],
  ])('history = %s keeps %s history', (value, method) => {
    const db = Database.openMemory();
    db.exec(`CREATE TABLE t(x) WITH (history = ${value})`);
    db.exec('INSERT INTO t VALUES (1)');
    expect(rows(db, `SELECT count(*) FROM smalt_${method === 'log' ? 'log' : 'versions'}_t`)).toEqual([[method === 'log' ? 1 : 0]]);
  });

  it("history = false, 'off' or no option keeps none; anything else is an error", () => {
    const db = Database.openMemory();
    db.exec("CREATE TABLE a(x) WITH (history = false); CREATE TABLE b(x) WITH (history = 'off'); CREATE TABLE c(x)");
    for (const t of ['a', 'b', 'c']) expect(() => rows(db, `SELECT x FROM ${t} FOR SYSTEM_TIME AS OF COMMIT 1`)).toThrow(/keeps no history/);
    expect(() => db.exec("CREATE TABLE d(x) WITH (history = 'forever')")).toThrow(/history must be 'versions', 'log', true or false/);
    expect(() => db.exec("CREATE TABLE e(x) WITH (history = true, storage = 'columnar')")).toThrow(/not columnar/);
  });
});

describe.each(['true', "'log'"])('FOR SYSTEM_TIME AS OF (history = %s)', (history) => {
  it('COMMIT and TRANSACTION read a table as a commit left it', () => {
    const { db, c } = fresh(history);
    expect(rows(db, `SELECT id, v FROM t FOR SYSTEM_TIME AS OF COMMIT ${c[0]} ORDER BY id`)).toEqual([
      [1, 'a'],
      [2, 'x'],
    ]);
    expect(rows(db, `SELECT id, v FROM t FOR SYSTEM_TIME AS OF TRANSACTION ${c[1]} ORDER BY id`)).toEqual([
      [1, 'b'],
      [2, 'x'],
    ]);
    expect(rows(db, `SELECT id, v FROM t FOR SYSTEM_TIME AS OF COMMIT ${c[2]}`)).toEqual([[1, 'b']]);
    expect(rows(db, `SELECT id FROM t FOR SYSTEM_TIME AS OF COMMIT ${c[0] - 1}`)).toEqual([]);
  });

  it('takes parameters, subqueries and an alias, and joins the present with the past', () => {
    const { db, c } = fresh(history);
    expect(rows(db, 'SELECT old.v FROM t FOR SYSTEM_TIME AS OF COMMIT ? AS old WHERE old.id = 1', [c[0]])).toEqual([['a']]);
    expect(rows(db, 'SELECT v FROM t FOR SYSTEM_TIME AS OF COMMIT (SELECT min(id) FROM smalt_commits) old WHERE id = 1')).toEqual([['a']]);
    expect(rows(db, `SELECT now.v, was.v FROM t AS now JOIN t FOR SYSTEM_TIME AS OF COMMIT ${c[0]} AS was USING (id)`)).toEqual([['b', 'a']]);
  });

  it('a view reading the past keeps reading it (it is not merged into the outer query)', () => {
    const { db, c } = fresh(history);
    db.exec(`CREATE VIEW first AS SELECT id, v FROM t FOR SYSTEM_TIME AS OF COMMIT ${c[0]}`);
    expect(rows(db, 'SELECT v FROM first ORDER BY id')).toEqual([['a'], ['x']]);
    expect(rows(db, 'SELECT f.v, t.v FROM first AS f JOIN t USING (id)')).toEqual([['a', 'b']]);
  });

  it('a forgotten past is an error', () => {
    const { db, c } = fresh(history);
    db.queryPlan({ kind: 'maintenance', action: 'forget', before: { commit: { k: 'lit', value: c[2], type: 'int' } } } as never);
    expect(() => rows(db, `SELECT * FROM t FOR SYSTEM_TIME AS OF COMMIT ${c[0]}`)).toThrow(/history before commit/);
  });
});

describe('FOR SYSTEM_TIME AS OF a time', () => {
  it('reads the last commit at or before the time, as SQLite reads dates (UTC)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(Date.UTC(2026, 10, 17, 10, 0, 0));
      const db = Database.openMemory();
      db.exec('CREATE TABLE t(id INTEGER PRIMARY KEY, v TEXT) WITH (history = true)');
      db.exec("INSERT INTO t VALUES (1, 'morning')");
      vi.setSystemTime(Date.UTC(2026, 10, 17, 15, 0, 0));
      db.exec("UPDATE t SET v = 'afternoon'");
      expect(rows(db, "SELECT v FROM t FOR SYSTEM_TIME AS OF '2026-11-17 12:00:00'")).toEqual([['morning']]);
      expect(rows(db, "SELECT v FROM t FOR SYSTEM_TIME AS OF TIMESTAMP '2026-11-17 15:00:00'")).toEqual([['afternoon']]);
      expect(rows(db, "SELECT v FROM t FOR SYSTEM_TIME AS OF '2026-11-17T10:00:00.000'")).toEqual([['morning']]);
      expect(rows(db, "SELECT v FROM t FOR SYSTEM_TIME AS OF '2026-11-16'")).toEqual([]);
      expect(rows(db, "SELECT v FROM t FOR SYSTEM_TIME AS OF datetime('2026-11-17 12:00:00', '+4 hours')")).toEqual([['afternoon']]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('the syntax', () => {
  it('needs AS OF after SYSTEM_TIME; a table named system_time or a column named timestamp are unaffected', () => {
    const db = Database.openMemory();
    db.exec('CREATE TABLE system_time(timestamp INTEGER); INSERT INTO system_time VALUES (5)');
    expect(rows(db, 'SELECT timestamp FROM system_time')).toEqual([[5]]);
    expect(() => db.exec('SELECT * FROM system_time FOR SYSTEM_TIME 3')).toThrow();
  });

  it('a view with TABLESAMPLE keeps sampling (it was merged without its sample before)', () => {
    const db = Database.openMemory();
    db.exec('CREATE TABLE n(i); INSERT INTO n VALUES (1), (2), (3); CREATE VIEW none_ AS SELECT i FROM n TABLESAMPLE BERNOULLI (0)');
    expect(rows(db, 'SELECT * FROM none_')).toEqual([]);
  });
});
