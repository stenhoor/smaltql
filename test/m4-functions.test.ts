// smaltdb ADR 0022 step 4: REGEXP and the regexp_* functions, isnan, arg_min / arg_max, IGNORE NULLS.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const all = (sql: string): unknown[][] => Database.openMemory().prepare(sql).all();
const one = (sql: string): unknown => all(sql)[0]![0];

describe('SQL spellings of the engine operations (ADR 0022 step 4)', () => {
  it.each([
    ["'abc' REGEXP 'b.'", 1],
    ["'abc' NOT REGEXP 'b.'", 0],
    ["'ABC' REGEXP 'b'", 0],
    ["NULL REGEXP 'b'", null],
    ["regexp_like('ABC', 'b', 'i')", 1],
    ["regexp_substr('x12y34', '[0-9]+')", '12'],
    ["regexp_replace('a1b2', '[0-9]', '#')", 'a#b2'],
    ["regexp_replace('a1b2', '[0-9]', '#', 'g')", 'a#b#'],
    ["regexp_replace('A1a2', 'a', '_', 'gi')", '_1_2'],
    ['isnan(1.5)', 0],
    ['isnan(NULL)', null],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it('isnan finds a NaN another language stored (SQL binds a NaN parameter as NULL)', async () => {
    const db = Database.openMemory() as unknown as Database & { queryPlanAsync(s: unknown): Promise<unknown> };
    db.prepare('CREATE TABLE t(x REAL)').run();
    const values = { op: 'values', rows: [[{ k: 'lit', value: Number.NaN, type: 'real' }], [{ k: 'lit', value: 1.5, type: 'real' }]], types: ['real'] };
    await db.queryPlanAsync({ kind: 'write', plan: { op: 'append', table: 't', db: 'main', input: values, columns: [0], upserts: [] } });
    expect(db.prepare('SELECT isnan(x) FROM t').all()).toEqual([[1], [0]]);
  });

  it('arg_min and arg_max give the value at the least and greatest key', () => {
    expect(all("SELECT arg_min(x, k), arg_max(x, k) FROM (SELECT 'a' AS x, 2 AS k UNION ALL SELECT 'b', 1 UNION ALL SELECT 'c', 3)")).toEqual([['b', 'c']]);
  });

  it('IGNORE NULLS skips NULL values in navigation windows', () => {
    const rows = all('SELECT i, lag(x) IGNORE NULLS OVER (ORDER BY i) FROM (SELECT 1 AS i, 10 AS x UNION ALL SELECT 2, NULL UNION ALL SELECT 3, 30) ORDER BY i');
    expect(rows).toEqual([[1, null], [2, 10], [3, 10]]);
  });

  it('IGNORE NULLS needs OVER', () => {
    expect(() => all('SELECT first(x) IGNORE NULLS FROM (SELECT 1 AS x)')).toThrow(/only valid with window functions/);
  });
});
