// smaltdb ADR 0027: a view keeps its interface, the columns it gave when it was made. SQL binds a view's text itself,
// so where the engine says a view is reshaped, it reads the interface's columns, converted.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

/** Rebuild t in one transaction, as a column's type is changed: copy into t2, drop t, rename t2 to t. */
const rebuild = (d: Database, columns: string, select: string): void =>
  d.exec(`BEGIN; CREATE TABLE t2(${columns}); INSERT INTO t2 SELECT ${select} FROM t; DROP TABLE t; ALTER TABLE t2 RENAME TO t; COMMIT`);

describe('views read as their interface says (smaltdb ADR 0027)', () => {
  it('give a column whose type changed losslessly as the interface type', () => {
    const d = Database.openMemory();
    d.exec(`CREATE TABLE t(id INTEGER PRIMARY KEY, code TEXT); INSERT INTO t VALUES (1, '42'); CREATE VIEW v AS SELECT id, code FROM t`);
    rebuild(d, 'id INTEGER PRIMARY KEY, code INTEGER', 'id, CAST(code AS INTEGER)');
    expect(d.query('SELECT code FROM v').rows).toEqual([['42']]);
    expect(d.query('SELECT typeof(code) FROM v').rows).toEqual([['text']]);
    // Joined and filtered, where views are otherwise flattened into the query.
    expect(d.query('SELECT v.code FROM t JOIN v ON v.id = t.id WHERE v.code = \'42\'').rows).toEqual([['42']]);
    // A view over the view sees the interface too.
    d.exec('CREATE VIEW w AS SELECT code FROM v');
    expect(d.query('SELECT code FROM w').rows).toEqual([['42']]);
  });

  it('keep a view over * to the columns it had when a column is added', () => {
    const d = Database.openMemory();
    d.exec(`CREATE TABLE t(a INTEGER, b TEXT); INSERT INTO t VALUES (1, 'x'); CREATE VIEW s AS SELECT * FROM t`);
    d.exec('ALTER TABLE t ADD COLUMN c TEXT');
    const r = d.query('SELECT * FROM s');
    expect(r.columns).toEqual(['a', 'b']);
    expect(r.rows).toEqual([[1, 'x']]);
    expect(d.query('SELECT s.* FROM t JOIN s ON s.a = t.a').rows).toEqual([[1, 'x']]);
  });

  it('read a view that still gives its interface as before', () => {
    const d = Database.openMemory();
    d.exec(`CREATE TABLE t(a INTEGER, b TEXT); INSERT INTO t VALUES (1, 'x'); CREATE VIEW v AS SELECT a, b FROM t`);
    d.exec('ALTER TABLE t RENAME COLUMN b TO bb');
    expect(d.query('SELECT * FROM v').rows).toEqual([[1, 'x']]);
  });
});
