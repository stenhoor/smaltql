// CREATE TABLE … AS SELECT, as SQLite makes it. The expected texts and rows are SQLite 3.53's.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.exec(`CREATE TABLE t(a INTEGER, v VARCHAR(10) COLLATE NOCASE, r FLOAT, b BOOLEAN, x, "odd name" TEXT);
    INSERT INTO t VALUES (1, 'A', 1.5, 1, NULL, 'z')`);
  return d;
}
const sqlOf = (d: Database, name: string) => d.query(`SELECT sql FROM sqlite_schema WHERE name = '${name}'`).rows[0]?.[0];

describe('CREATE TABLE … AS SELECT', () => {
  it('names and declares columns as SQLite does, and stores the same text', () => {
    const d = db();
    d.exec(`CREATE TABLE t2 AS SELECT a, v, r, b, x, a+1, 'k', 1.5, CAST(a AS TEXT), a, "odd name", a AS "a:1" FROM t`);
    expect(sqlOf(d, 't2')).toBe('CREATE TABLE t2(\n  a INT,\n  v TEXT,\n  r REAL,\n  b NUM,\n  x,\n  "a+1",\n  "\'k\'",\n  "1.5",\n  "CAST(a AS TEXT)" TEXT,\n  "a:1" INT,\n  "odd name" TEXT,\n  "a:2" INT\n)');
    expect(d.query('SELECT * FROM t2').rows).toEqual([[1, 'A', 1.5, 1, null, 2, 'k', 1.5, '1', 1, 'z', 1]]);
  });

  it('keeps short definitions on one line, and quotes keywords', () => {
    const d = db();
    d.exec('CREATE TABLE t3 AS SELECT 1; CREATE TABLE "select" AS SELECT a FROM t WHERE 0');
    expect(sqlOf(d, 't3')).toBe('CREATE TABLE t3("1")');
    expect(sqlOf(d, 'select')).toBe('CREATE TABLE "select"(a INT)');
    expect(d.query('SELECT count(*) FROM "select"').rows).toEqual([[0]]);
  });

  it('converts values by the new columns’ affinity', () => {
    const d = db();
    d.exec("CREATE TABLE c AS SELECT CAST(a AS TEXT) AS s, CAST('7' AS INTEGER) AS i FROM t");
    d.exec("INSERT INTO c VALUES (2, '8')");
    expect(d.query('SELECT typeof(s), typeof(i) FROM c').rows).toEqual([['text', 'integer'], ['text', 'integer']]);
  });

  it('IF NOT EXISTS leaves an existing table as it is', () => {
    const d = db();
    d.exec('CREATE TABLE t3 AS SELECT 1');
    d.exec('CREATE TABLE IF NOT EXISTS t3 AS SELECT 1, 2');
    expect(d.query('SELECT * FROM t3').rows).toEqual([[1]]);
    expect(() => d.exec('CREATE TABLE t3 AS SELECT 2')).toThrow(/already exists/);
  });

  it('reads parameters, and reports the rows it wrote', () => {
    const d = db();
    d.exec('INSERT INTO t(a) VALUES (2), (3)');
    const r = d.prepare('CREATE TABLE big AS SELECT a FROM t WHERE a > ?').run([1]);
    expect(r.changes).toBe(2);
    expect(d.query('SELECT a FROM big ORDER BY a').rows).toEqual([[2], [3]]);
  });

  it('leaves no table when the query fails', () => {
    const d = db();
    expect(() => d.exec('CREATE TABLE bad AS SELECT abs(-9223372036854775808) FROM t')).toThrow(/overflow/);
    expect(() => d.query('SELECT * FROM bad')).toThrow(/no such table/);
  });

  it('makes TEMP tables, and tables from joins, aggregates and CTEs', () => {
    const d = db();
    d.exec("CREATE TEMP TABLE tt AS WITH w(k, n) AS (VALUES ('x', 1), ('x', 2), ('y', 3)) SELECT k, sum(n) AS total FROM w GROUP BY k");
    expect(d.query('SELECT * FROM temp.tt ORDER BY k').rows).toEqual([['x', 3], ['y', 3]]);
    d.exec('CREATE TABLE j AS SELECT t.a, tt.total FROM t JOIN tt ON tt.total = t.a + 2');
    expect(d.query('SELECT * FROM j').rows).toEqual([[1, 3], [1, 3]]);
  });

  it('is a table like any other: ALTER TABLE edits its stored text', () => {
    const d = db();
    d.exec('CREATE TABLE t3 AS SELECT a, v FROM t');
    d.exec('ALTER TABLE t3 RENAME COLUMN v TO name');
    expect(sqlOf(d, 't3')).toBe('CREATE TABLE t3(a INT,name TEXT)');
    expect(d.query('SELECT name FROM t3').rows).toEqual([['A']]);
  });
});
