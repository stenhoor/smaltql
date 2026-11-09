// Values computed by the engine's date, list and truth-valued functions reach SQL as SQLite would hold them, as the
// same values read from columns do (smaltdb ADR 0022, step 1).
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const one = (sql: string): unknown => Database.openMemory().prepare(sql).all()[0]![0];

describe('computed values as SQL holds them', () => {
  it.each([
    ["strftime('%Y', make_date(2026,1,1))", '2026'],
    ["date(make_date(2026,1,1), '+1 month')", '2026-02-01'],
    ["parse_datetime('2026-11-07 10:00:00') > '2026-01-01'", 1],
    ['typeof(make_date(2026,11,7))', 'text'],
    ["list_of(1,2) || 'x'", '[1,2]x'],
    ['length(list_of(1,2))', 5],
    ['list_of(1,2)', '[1,2]'],
    ["regex_match('abc','b')", 1],
    ['list_contains(list_of(1,2),3)', 0],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it('engine functions still take the values under the text', () => {
    expect(one('SELECT year(make_date(2026,11,7))')).toBe(2026);
    expect(one('SELECT list_len(list_of(1,2,3))')).toBe(3);
    expect(one("SELECT trunc_temporal(parse_datetime('2026-11-07 10:31:00'),'hour')")).toBe('2026-11-07 10:00:00');
  });

  it('an aggregate list reads as JSON text', () => {
    expect(one('SELECT implode(x) FROM (SELECT 1 x UNION ALL SELECT 2)')).toBe('[1,2]');
  });
});
