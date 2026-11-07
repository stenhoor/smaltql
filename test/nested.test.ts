/**
 * Lists and structs in SQL (smaltdb ADR 0020, section 6): SQL has no list type, so a list or struct column that another
 * language (or a Parquet file) gives reads as its JSON text, in results and everywhere else. Equality of two columns
 * of one list or struct type stays on the values, which are equal exactly when the texts are.
 */
import { describe, expect, it } from 'vitest';
import { Database, plan as p } from 'smaltdb/engine';

/** A table `ev(id INTEGER, tags list<text>, pt struct<x real, y real>, tags2 list<text>)`, as a plan defines it. */
function eventsDb(): Database {
  const db = Database.openMemory();
  const col = (name: string, type: string, declaredType = type) => ({ name, declaredType, type, notNull: false, collation: 'binary' });
  db.queryPlan({
    kind: 'schema',
    op: {
      op: 'createTable',
      table: { name: 'ev', columns: [col('id', 'INTEGER'), col('tags', 'LIST', 'list<text>'), col('pt', 'STRUCT', 'struct<x real, y real>'), col('tags2', 'LIST', 'list<text>')], keys: [], checks: [], foreignKeys: [], storage: 'row' },
      temp: false,
      ifNotExists: false,
    },
  } as never);
  const data = p.fromColumns(
    [
      [1, 2, 3],
      [['a', 'b'], [], null],
      [{ x: 1, y: 2.5 }, { x: null, y: -1 }, null],
      [['a', 'b'], ['z'], null],
    ],
    ['int', 'list<text>', 'struct<x real, y real>', 'list<text>'],
  );
  db.queryPlan({ kind: 'write', plan: p.append('ev', data, [0, 1, 2, 3]) });
  return db;
}

describe('lists and structs in SQL', () => {
  it('read as their JSON text', () => {
    const db = eventsDb();
    const st = db.prepare('SELECT tags, pt FROM ev ORDER BY id');
    expect(st.all()).toEqual([
      ['["a","b"]', '{"x":1,"y":2.5}'],
      ['[]', '{"x":null,"y":-1}'],
      [null, null],
    ]);
    expect(st.columnTypes).toEqual(['text', 'text']);
    expect(db.query("SELECT typeof(tags), length(tags), tags LIKE '%\"b\"%', pt || '!' FROM ev WHERE id = 1").rows).toEqual([['text', 9, 1, '{"x":1,"y":2.5}!']]);
  });

  it('compare with text as their text does; equal columns of one type compare as values', () => {
    const db = eventsDb();
    const ids = (where: string) => db.query(`SELECT id FROM ev WHERE ${where} ORDER BY id`).rows.map((r) => r[0]);
    expect(ids(`tags = '["a","b"]'`)).toEqual([1]);
    expect(ids("tags = '[]'")).toEqual([2]);
    expect(ids('tags = tags2')).toEqual([1]);
    expect(ids('tags != tags2')).toEqual([2]);
    expect(ids('tags IS tags2')).toEqual([1, 3]);
    // An ordering compares the text: ']' sorts after '"', so '[]' > '["z"]' (as values, [] < ["z"]).
    expect(ids('tags > tags2')).toEqual([2]);
    expect(ids('tags < tags2')).toEqual([]);
    expect(db.query('SELECT count(DISTINCT tags), group_concat(tags, \';\') FROM ev').rows).toEqual([[2, '["a","b"];[]']]);
  });
});
