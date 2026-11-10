// smaltdb ADR 0022 step 3 (functions): EXTRACT, date_part, date_trunc, text into the date functions, now(),
// make_timestamp, strptime.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

const all = (sql: string): unknown[][] => Database.openMemory().prepare(sql).all();
const one = (sql: string): unknown => all(sql)[0]![0];

describe('dates and times in SQL (ADR 0022 step 3)', () => {
  it.each([
    ["year('2026-11-07')", 2026],
    ["month('2026-11-07 10:30:00')", 11],
    ["hour('2026-11-07 10:30:00')", 10],
    ["year('not a date')", null],
    ["EXTRACT(year FROM '2026-11-07')", 2026],
    ["EXTRACT(MINUTE FROM '2026-11-07 10:30:00')", 30],
    ["EXTRACT(isodow FROM '2026-11-08')", 7],
    ["date_part('doy', '2026-02-01')", 32],
    ["EXTRACT(year FROM make_date(2025, 1, 2))", 2025],
    ["date_trunc('month', '2026-11-07 10:30:00')", '2026-11-01 00:00:00'],
    ["date_trunc('hour', make_datetime(2026, 11, 7, 10, 31))", '2026-11-07 10:00:00'],
    ['make_timestamp(2026, 11, 7, 14, 30)', '2026-11-07 14:30:00'],
    ["strptime('07/11/2026', '%d/%m/%Y')", '2026-11-07 00:00:00'],
    ["typeof(now())", 'text'],
    ["now() = CURRENT_TIMESTAMP", 1],
  ])('%s', (expr, want) => expect(one(`SELECT ${expr}`)).toBe(want));

  it.each(['trunc_temporal', 'parse_date', 'parse_datetime', 'format_temporal'])('the engine name %s is not SQL', (fn) =>
    expect(() => all(`SELECT ${fn}('2026-11-07', 'x')`)).toThrow(/no such function/),
  );

  it('an unknown field is an error', () => {
    expect(() => all("SELECT date_part('fortnight', '2026-11-07')")).toThrow(/unknown field fortnight/);
  });

  it('a DATE column holding SQL date text', () => {
    const db = Database.openMemory();
    db.prepare('CREATE TABLE t(d DATE)').run();
    db.prepare("INSERT INTO t VALUES ('2026-11-07')").run();
    expect(db.prepare('SELECT EXTRACT(month FROM d), year(d) FROM t').all()).toEqual([[11, 2026]]);
  });
});
