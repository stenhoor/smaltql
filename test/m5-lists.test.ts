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
