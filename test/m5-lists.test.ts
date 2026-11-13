// smaltdb ADR 0022 step 5: ARRAY[…], the array_* names, cardinality, = ANY, array_agg.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const all = (sql: string): unknown[][] => Database.openMemory().prepare(sql).all();
const one = (sql: string): unknown => all(sql)[0]![0];

describe('lists in SQL (ADR 0022 step 5)', () => {
  it.each([
    ['ARRAY[1, 2, 3]', '[1,2,3]'],
    ['ARRAY[]', '[]'],
    ["ARRAY['a', NULL]", '["a",null]'],
    ['cardinality(ARRAY[1, 2, 3])', 3],
    ['array_length(ARRAY[1, 2])', 2],
    ['array_contains(ARRAY[1, 2], 2)', 1],
    ['2 = ANY (ARRAY[1, 2])', 1],
    ['3 = ANY (ARRAY[1, 2])', 0],
    // Three-valued, as PostgreSQL (smaltql#49).
    ['NULL = ANY (ARRAY[1])', null],
    ['3 = ANY (ARRAY[1, NULL])', null],
    ['1 = ANY (ARRAY[1, NULL])', 1],
    ['1 = ANY (ARRAY[])', 0],
    ['array_contains(ARRAY[1, NULL], NULL)', 1],
    ['array_cat(ARRAY[1], ARRAY[2, 3])', '[1,2,3]'],
    ["array_to_string(ARRAY['a', 'b'], '-')", 'a-b'],
    ['array_sort(ARRAY[3, 1, 2])', '[1,2,3]'],
    ['array_distinct(ARRAY[1, 1, 2])', '[1,2]'],
    ['array_reverse(ARRAY[1, 2, 3])', '[3,2,1]'],
    ['list_extract(ARRAY[10, 20, 30], 1)', 10],
    ['list_extract(ARRAY[10, 20, 30], -1)', 30],
    ['list_extract(ARRAY[10, 20, 30], 0)', null],
    ['list_extract(ARRAY[10, 20, 30], 4)', null],
    ['array_slice(ARRAY[10, 20, 30, 40], 2, 3)', '[20,30]'],
    // Negative positions count from the end, as DuckDB's (smaltql#49).
    ['array_slice(ARRAY[1, 2, 3, 4], -2, -1)', '[3,4]'],
    ['array_slice(ARRAY[1, 2, 3, 4], 2, -1)', '[2,3,4]'],
    ['array_slice(ARRAY[1, 2, 3, 4], -3, 3)', '[2,3]'],
    ['array_slice(ARRAY[1, 2, 3, 4], -10, 2)', '[1,2]'],
    ['array_slice(ARRAY[1, 2, 3, 4], 1, 10)', '[1,2,3,4]'],
    ['array_slice(ARRAY[1, 2, 3, 4], 0, 2)', '[1,2]'],
    ['array_slice(ARRAY[1, 2, 3, 4], 5, 6)', '[]'],
    ['array_slice(ARRAY[1, 2, 3, 4], -1, -2)', '[]'],
    ['array_slice(ARRAY[1, 2], NULL, 2)', null],
    ['list_sum(ARRAY[1, 2, 3])', 6],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it('array_agg gathers a group as a list', () => {
    expect(all('SELECT k, array_agg(x) FROM (SELECT 1 AS k, 10 AS x UNION ALL SELECT 1, 20 UNION ALL SELECT 2, 30) GROUP BY k ORDER BY k')).toEqual([[1, '[10,20]'], [2, '[30]']]);
  });

  it.each(['list_len', 'list_contains', 'list_get', 'list_slice', 'list_concat', 'list_join', 'list_sort', 'list_unique', 'list_reverse'])(
    'the engine name %s is not SQL',
    (fn) => expect(() => all(`SELECT ${fn}(ARRAY[1], 1)`)).toThrow(/no such function/),
  );

  it('[x] still quotes an identifier', () => {
    expect(all('SELECT [a] FROM (SELECT 1 AS a)')).toEqual([[1]]);
    expect(all('SELECT 1 [array]')).toEqual([[1]]);
  });
});

// smaltdb ADR 0031 step 7: the functions of one list, by the engine's names; positions from 1, as list_extract.
describe('functions of one list (ADR 0031 step 7)', () => {
  it.each([
    ['list_median(ARRAY[3, 1, NULL, 2, 4])', 2.5],
    ['list_var(ARRAY[3, 1, 2])', 1],
    ['list_var(ARRAY[3, 1, 2], 0)', 2 / 3],
    ['list_std(ARRAY[3, 1, 2])', 1],
    ['list_std(ARRAY[7])', null],
    ['list_n_unique(ARRAY[1, NULL, 1, 2, NULL])', 3],
    ['list_arg_min(ARRAY[3, 1, NULL, 1])', 2],
    ['list_arg_max(ARRAY[3, 1, 5, 5])', 3],
    ['list_arg_min(ARRAY[])', null],
    ['list_count_matches(ARRAY[1, 2, 1], 1)', 2],
    ['list_all(ARRAY[1 = 1, NULL])', 1],
    ['list_any(ARRAY[1 = 2])', 0],
    ['list_drop_nulls(ARRAY[1, NULL, 2])', '[1,2]'],
    ['list_shift(ARRAY[1, 2, 3])', '[null,1,2]'],
    ['list_shift(ARRAY[1, 2, 3], -1)', '[2,3,null]'],
    ['list_diff(ARRAY[1, 4, 9])', '[null,3,5]'],
    ['list_gather(ARRAY[10, 20, 30], ARRAY[1, -1, 0, 9, NULL])', '[10,30,null,null,null]'],
    ['list_gather_every(ARRAY[1, 2, 3, 4, 5], 2)', '[1,3,5]'],
    ['list_gather_every(ARRAY[1, 2, 3, 4, 5], 2, 2)', '[2,4]'],
    ['list_sample(ARRAY[1, 2, 3], 3)', '[1,2,3]'],
    ['list_item(ARRAY[7])', 7],
    ['list_union(ARRAY[1, 2, 2], ARRAY[3, 1])', '[1,2,3]'],
    ['list_intersect(ARRAY[3, 1, 2], ARRAY[2, 3])', '[3,2]'],
    ['list_except(ARRAY[3, 1, 2], ARRAY[3])', '[1,2]'],
    ['list_symmetric_except(ARRAY[1, 2], ARRAY[2, 3])', '[1,3]'],
  ])('%s', (expr, want) => {
    const got = one(`SELECT ${expr}`);
    if (typeof want === 'number' && !Number.isInteger(want)) expect(got).toBeCloseTo(want, 12);
    else expect(got).toBe(want);
  });

  it('errors', () => {
    expect(() => one('SELECT list_item(ARRAY[1, 2])')).toThrow(/list_item: the list has 2 elements, not 1/);
    expect(() => one("SELECT list_median(ARRAY['a'])")).toThrow(/list_median takes a list of numbers/);
    expect(() => one('SELECT list_arg_min(ARRAY[1], 2)')).toThrow(/wrong number of arguments to function list_arg_min/);
    // The engine's further arguments mean other things under these names elsewhere: SQL keeps them out.
    expect(() => one("SELECT array_to_string(ARRAY['a', NULL], '-', '*')")).toThrow(/wrong number of arguments to function array_to_string/);
    expect(() => one('SELECT array_sort(ARRAY[1], 0, 1)')).toThrow(/wrong number of arguments to function array_sort/);
    expect(() => one('SELECT array_contains(ARRAY[1], 1, 0)')).toThrow(/wrong number of arguments to function array_contains/);
  });

  it('reads list columns', () => {
    const db = Database.openMemory();
    // SQL has no list column type to write: the table is made by a plan, as smaltdf makes one.
    const col = (name: string, type: string, declaredType: string) => ({ name, declaredType, type, notNull: false, collation: 'binary' });
    db.queryPlan({ kind: 'schema', op: { op: 'createTable', table: { name: 't', columns: [col('id', 'INTEGER', 'INTEGER'), col('v', 'LIST', 'list<int>')], keys: [], checks: [], foreignKeys: [], storage: 'row' }, temp: false, ifNotExists: false } } as never);
    db.exec('INSERT INTO t VALUES (1, ARRAY[3, 1, 2]), (2, ARRAY[]), (3, NULL)');
    expect(db.prepare('SELECT id, list_median(v), list_arg_max(v), list_gather(v, ARRAY[1, 2]) FROM t ORDER BY id').all()).toEqual([
      [1, 2, 1, '[3,1]'],
      [2, null, null, '[null,null]'],
      [3, null, null, null],
    ]);
  });
});
