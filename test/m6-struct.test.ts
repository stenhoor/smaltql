// smaltdb ADR 0022 step 6: struct fields, (s).name.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

async function db(): Promise<Database> {
  const d = Database.openMemory() as Database & { queryPlanAsync(s: unknown): Promise<unknown> };
  const type = 'struct<name text, score real, tags list<text>>';
  await d.queryPlanAsync({ kind: 'schema', op: { op: 'createTable', table: { name: 't', columns: [{ name: 's', declaredType: type, type: 'STRUCT', notNull: false, collation: 'binary' }], keys: [], checks: [], foreignKeys: [], storage: 'row' }, temp: false, ifNotExists: false } });
  const values = { op: 'values', rows: [], types: [type], columns: [[{ name: 'a', score: 2.5, tags: ['x', 'y'] }, null]] };
  await d.queryPlanAsync({ kind: 'write', plan: { op: 'append', table: 't', db: 'main', input: values, columns: [0], upserts: [] } });
  return d;
}

describe('struct fields (ADR 0022 step 6)', () => {
  it('(s).name reads a field, as SQL holds it', async () => {
    expect((await db()).prepare('SELECT (s).name, (s).score, s FROM t').all()).toEqual([
      ['a', 2.5, '{"name":"a","score":2.5,"tags":["x","y"]}'],
      [null, null, null],
    ]);
  });

  it('names match regardless of case, and a field can feed other functions', async () => {
    expect((await db()).prepare('SELECT upper((s).NAME), (s).score * 2 FROM t WHERE s IS NOT NULL').all()).toEqual([['A', 5]]);
  });

  it('a field that is a list or struct is not supported yet', async () => {
    await expect(db().then((d) => d.prepare('SELECT (s).tags FROM t').all())).rejects.toThrow(/not supported yet/);
  });

  it('errors', async () => {
    const d = await db();
    expect(() => d.prepare('SELECT (s).nope FROM t').all()).toThrow(/no such field: nope \(fields: name, score, tags\)/);
    expect(() => d.prepare("SELECT ('x').name").all()).toThrow(/needs a struct/);
    expect(() => d.prepare('SELECT struct_field(s, 0) FROM t').all()).toThrow(/no such function/);
  });
});
