// smaltdb ADR 0022 step 7: ASOF JOIN.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.prepare('CREATE TABLE trades(sym TEXT, t INTEGER)').run();
  d.prepare('CREATE TABLE quotes(sym TEXT, t INTEGER, px REAL)').run();
  d.prepare("INSERT INTO trades VALUES ('a', 5), ('a', 10), ('b', 3), ('a', 1)").run();
  d.prepare("INSERT INTO quotes VALUES ('a', 2, 1.0), ('a', 8, 2.0), ('b', 4, 3.0), ('a', 12, 4.0)").run();
  return d;
}
const all = (sql: string): unknown[][] => db().prepare(sql).all();

describe('ASOF JOIN (ADR 0022 step 7)', () => {
  it('backward: the latest quote at or before each trade; trades without one drop', () => {
    expect(all('SELECT tr.sym, tr.t, q.px FROM trades tr ASOF JOIN quotes q ON tr.sym = q.sym AND tr.t >= q.t ORDER BY tr.sym, tr.t')).toEqual([
      ['a', 5, 1.0],
      ['a', 10, 2.0],
    ]);
  });

  it('ASOF LEFT JOIN keeps them, with NULLs', () => {
    expect(all('SELECT tr.sym, tr.t, q.px FROM trades tr ASOF LEFT JOIN quotes q ON tr.sym = q.sym AND tr.t >= q.t ORDER BY tr.sym, tr.t')).toEqual([
      ['a', 1, null],
      ['a', 5, 1.0],
      ['a', 10, 2.0],
      ['b', 3, null],
    ]);
  });

  it('forward, and with the sides written the other way round', () => {
    const want = [['a', 1, 1.0], ['a', 5, 2.0], ['a', 10, 4.0], ['b', 3, 3.0]];
    expect(all('SELECT tr.sym, tr.t, q.px FROM trades tr ASOF JOIN quotes q ON tr.sym = q.sym AND tr.t <= q.t ORDER BY tr.sym, tr.t')).toEqual(want);
    expect(all('SELECT tr.sym, tr.t, q.px FROM trades tr ASOF JOIN quotes q ON q.sym = tr.sym AND q.t >= tr.t ORDER BY tr.sym, tr.t')).toEqual(want);
  });

  it('errors', () => {
    expect(() => all('SELECT * FROM trades ASOF JOIN quotes ON trades.sym = quotes.sym')).toThrow(/needs an inequality/);
    expect(() => all('SELECT * FROM trades ASOF JOIN quotes ON trades.t > quotes.t')).toThrow(/use >= or <=/);
  });

  it('asof is still an alias where no join follows', () => {
    expect(all('SELECT asof.t FROM trades asof WHERE asof.t = 1')).toEqual([[1]]);
  });
});
