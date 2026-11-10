// smaltdb ADR 0022 step 3, part 2: DATE / TIMESTAMP literals, INTERVAL, date ± int.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const all = (sql: string): unknown[][] => Database.openMemory().prepare(sql).all();
const one = (sql: string): unknown => all(sql)[0]![0];

describe('date literals and intervals (ADR 0022 step 3)', () => {
  it.each([
    ["DATE '2026-11-07'", '2026-11-07'],
    ["TIMESTAMP '2026-11-07 10:30:00'", '2026-11-07 10:30:00'],
    ["TIME '12:30:00'", '12:30:00'],
    ["TIME '08:05'", '08:05:00'],
    ["typeof(DATE '2026-11-07')", 'text'],
    ["DATE '2026-11-07' > '2026-01-01'", 1],
    ["DATE '2026-01-31' + INTERVAL '1 month'", '2026-02-28'],
    ["TIMESTAMP '2026-11-07 10:00:00' + INTERVAL '1 day 2 hours'", '2026-11-08 12:00:00'],
    ["TIMESTAMP '2026-11-07 10:00:00' - INTERVAL '30 minutes'", '2026-11-07 09:30:00'],
    ["TIMESTAMP '2026-11-07 10:00:00' - INTERVAL '1 hour 30 minutes'", '2026-11-07 08:30:00'],
    ["TIMESTAMP '2026-11-07 10:00:00' + INTERVAL '-1 hour -30 minutes'", '2026-11-07 08:30:00'],
    ["TIMESTAMP '2026-11-07 10:00:00' - INTERVAL '-1 hour -30 minutes'", '2026-11-07 11:30:00'],
    ["'2026-11-07' + INTERVAL '1 week'", '2026-11-14 00:00:00'],
    ["INTERVAL '1 year' + DATE '2026-02-28'", '2027-02-28'],
    ["'2026-11-07' + 1", 2027],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it.each([
    ["SELECT DATE 'not a date'", /./],
    ["SELECT TIME 'noon'", /'noon' is not a time/],
    ["SELECT INTERVAL '1 day'", /INTERVAL can only be added/],
    ["SELECT DATE '2026-11-07' + INTERVAL '1 hour -30 minutes'", /mixes positive and negative parts/],
    ["SELECT DATE '2026-11-07' + INTERVAL '1 fortnight'", /invalid INTERVAL unit/],
    ["SELECT DATE '2026-11-07' + INTERVAL 'soon'", /invalid INTERVAL/],
  ])('%s is an error', (sql, err) => expect(() => all(sql)).toThrow(err));

  it.each(['list_of', 'cast_date', 'cast_datetime'])('the engine name %s is not SQL', (fn) =>
    expect(() => all(`SELECT ${fn}('2026-11-07')`)).toThrow(/no such function/),
  );

  it('date, time and timestamp still name columns', () => {
    expect(all('SELECT date, time, timestamp FROM (SELECT 1 AS date, 3 AS time, 2 AS timestamp)')).toEqual([[1, 3, 2]]);
  });
});
