// Values computed by the engine's date, list and truth-valued functions reach SQL as SQLite would hold them, as the
// same values read from columns do (smaltdb ADR 0022, step 1).
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const one = (sql: string): unknown => Database.openMemory().prepare(sql).all()[0]![0];

describe('computed values as SQL holds them', () => {
  it.each([
    ["strftime('%Y', make_date(2026,1,1))", '2026'],
    ["date(make_date(2026,1,1), '+1 month')", '2026-02-01'],
    ["strptime('2026-11-07 10:00:00', '%Y-%m-%d %H:%M:%S') > '2026-01-01'", 1],
    ['typeof(make_date(2026,11,7))', 'text'],
    ["ARRAY[1,2] || 'x'", '[1,2]x'],
    ['length(ARRAY[1,2])', 5],
    ['ARRAY[1,2]', '[1,2]'],
    ["regex_match('abc','b')", 1],
    ['array_contains(ARRAY[1,2],3)', 0],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it('engine functions still take the values under the text', () => {
    expect(one('SELECT year(make_date(2026,11,7))')).toBe(2026);
    expect(one('SELECT cardinality(ARRAY[1,2,3])')).toBe(3);
    expect(one("SELECT date_trunc('hour', make_datetime(2026,11,7,10,31))")).toBe('2026-11-07 10:00:00');
  });

  it('an aggregate list reads as JSON text', () => {
    expect(one('SELECT implode(x) FROM (SELECT 1 x UNION ALL SELECT 2)')).toBe('[1,2]');
  });
});

describe('the functions SQL calls (smaltdb ADR 0022, decision 2)', () => {
  it.each(['div_float(7, 2)', 'div_floor(7, 2)', 'mod_floor(7, 2)', 'round_half_even(2.5)', 'round_half_away(2.5)', 'random_at(1, 2)', 'struct_of(1)'])(
    '%s is not SQL',
    (expr) => expect(() => one(`SELECT ${expr}`)).toThrow(/no such function/),
  );
  it.each(['sum_float', 'avg_float'])('%s is not SQL', (fn) => expect(() => one(`SELECT ${fn}(x) FROM (SELECT 1.0 x)`)).toThrow(/no such function/));
  it('round_even rounds halves to even', () => {
    expect(one('SELECT round_even(2.5)')).toBe(2);
    expect(one('SELECT round_even(0.125, 2)')).toBe(0.12);
  });
});

describe('lists, structs and dates written into columns of their type', () => {
  it('SQL writes a computed list or date into a plan-defined LIST or DATE column as its own type', async () => {
    const db = Database.openMemory() as unknown as Database & { queryPlanAsync(s: unknown): Promise<{ rows: unknown[][] }> };
    const col = (name: string, type: string, declaredType: string) => ({ name, declaredType, type, notNull: false, collation: 'binary' });
    await db.queryPlanAsync({ kind: 'schema', op: { op: 'createTable', table: { name: 'df', columns: [col('d', 'DATE', 'DATE'), col('tags', 'LIST', 'list<int>')], keys: [], checks: [], foreignKeys: [], storage: 'row' }, temp: false, ifNotExists: false } });
    db.prepare('INSERT INTO df VALUES (make_date(2026,1,2), ARRAY[1,2])').run();
    db.prepare('INSERT INTO df SELECT d, tags FROM df').run();
    db.prepare('UPDATE df SET tags = ARRAY[3] WHERE rowid = 2').run();
    const read = await db.queryPlanAsync({ kind: 'query', plan: { op: 'scan', table: 'df', columns: [0, 1] } });
    expect(read.rows).toEqual([['2026-01-02', [1, 2]], ['2026-01-02', [3]]]);
  });
});
