// smaltdb ADR 0022 step 6: unnest in FROM.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

async function db(): Promise<Database> {
  const d = Database.openMemory() as Database & { queryPlanAsync(s: unknown): Promise<unknown> };
  const col = (name: string, type: string, declaredType: string) => ({ name, declaredType, type, notNull: false, collation: 'binary' });
  await d.queryPlanAsync({ kind: 'schema', op: { op: 'createTable', table: { name: 't', columns: [col('id', 'INTEGER', 'INTEGER'), col('tags', 'LIST', 'list<text>')], keys: [], checks: [], foreignKeys: [], storage: 'row' }, temp: false, ifNotExists: false } });
  d.prepare("INSERT INTO t VALUES (1, ARRAY['a', 'b']), (2, ARRAY[]), (3, NULL), (4, ARRAY['c'])").run();
  return d;
}

describe('unnest (ADR 0022 step 6)', () => {
  it('FROM t, unnest(t.tags): one row per element; empty and NULL lists give none', async () => {
    expect((await db()).prepare('SELECT t.id, u.tag FROM t, unnest(t.tags) AS u(tag)').all()).toEqual([[1, 'a'], [1, 'b'], [4, 'c']]);
  });

  it('LEFT JOIN unnest(…) ON true keeps them with NULL', async () => {
    expect((await db()).prepare('SELECT t.id, u.tag FROM t LEFT JOIN unnest(t.tags) AS u(tag) ON true').all()).toEqual([[1, 'a'], [1, 'b'], [2, null], [3, null], [4, 'c']]);
  });

  it('WITH ORDINALITY numbers the elements from 1', async () => {
    expect((await db()).prepare('SELECT t.id, u.tag, u.pos FROM t, unnest(t.tags) WITH ORDINALITY AS u(tag, pos) WHERE t.id = 1').all()).toEqual([[1, 'a', 1], [1, 'b', 2]]);
  });

  it('of a list built in SQL, with default names, and joined further', async () => {
    const d = await db();
    expect(d.prepare('SELECT unnest FROM unnest(ARRAY[3, 1, 2])').all()).toEqual([[3], [1], [2]]);
    expect(d.prepare('SELECT x.unnest, x.ordinality FROM unnest(ARRAY[10, 20]) WITH ORDINALITY AS x').all()).toEqual([[10, 1], [20, 2]]);
    expect(d.prepare('SELECT t.id, u.tag, t2.id FROM t, unnest(t.tags) AS u(tag) JOIN t AS t2 ON t2.id = t.id + 1 WHERE u.tag = \'b\'').all()).toEqual([[1, 'b', 2]]);
  });

  it('errors', async () => {
    const d = await db();
    expect(() => d.prepare("SELECT * FROM unnest('a')").all()).toThrow(/unnest takes a list/);
    expect(() => d.prepare('SELECT * FROM unnest(ARRAY[1], ARRAY[2])').all()).toThrow(/several lists/);
    expect(() => d.prepare('SELECT * FROM t LEFT JOIN unnest(t.tags) AS u(tag) ON u.tag = 1').all()).toThrow(/ON true/);
  });
});
