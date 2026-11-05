/**
 * smaltql's SQL is the language smaltdb's databases read once it is registered: statements, views (bindView,
 * viewReferences), ALTER TABLE (the source editor) and stored definitions read back on open.
 */
import { describe, expect, it, vi } from 'vitest';
import { Database, MemoryVfs } from 'smaltdb/engine';
import { sqlLanguage } from '../src/index.js';

describe('smaltql in smaltdb', () => {
  it('runs statements, views and ALTER TABLE through smaltql', () => {
    const parse = vi.spyOn(sqlLanguage, 'parseOne');
    const view = vi.spyOn(sqlLanguage, 'bindView');
    const vfs = new MemoryVfs();
    let db = Database.openFile(vfs.openSync('q.db'), {}, vfs.openSync('q.db-wal'));
    db.exec('CREATE TABLE t(id INTEGER PRIMARY KEY, name TEXT); CREATE VIEW v AS SELECT id, upper(name) AS n FROM t');
    db.exec("INSERT INTO t(name) VALUES ('a'), ('b')");
    expect(db.prepare('SELECT n FROM v ORDER BY id').all()).toEqual([['A'], ['B']]);
    expect(parse).toHaveBeenCalledWith('SELECT n FROM v ORDER BY id');
    db.exec('ALTER TABLE t RENAME COLUMN name TO label');
    expect(db.query("SELECT sql FROM sqlite_schema WHERE name = 'v'").rows).toEqual([['CREATE VIEW v AS SELECT id, upper(label) AS n FROM t']]);
    db.close();
    db = Database.openFile(vfs.openSync('q.db'), {}, vfs.openSync('q.db-wal'));
    expect(db.query('SELECT n FROM v ORDER BY id').rows).toEqual([['A'], ['B']]);
    expect(view).toHaveBeenCalled();
    db.close();
  });
});
