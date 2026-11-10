// smaltdb ADR 0022 step 7: DISTINCT ON.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.prepare('CREATE TABLE r(shop TEXT, day INTEGER, amt INTEGER)').run();
  d.prepare("INSERT INTO r VALUES ('a', 1, 10), ('a', 3, 30), ('b', 2, 20), ('a', 2, 25), ('b', 1, 5), ('B', 4, 40)").run();
  return d;
}
const all = (sql: string): unknown[][] => db().prepare(sql).all();

describe('DISTINCT ON (ADR 0022 step 7)', () => {
  it('keeps the first row of each set, in ORDER BY order', () => {
    expect(all('SELECT DISTINCT ON (shop) shop, day, amt FROM r ORDER BY shop, day DESC')).toEqual([['B', 4, 40], ['a', 3, 30], ['b', 2, 20]]);
  });

  it('on several expressions, and on expressions not in the result', () => {
    expect(all('SELECT DISTINCT ON (shop, day > 1) amt FROM r ORDER BY shop, day > 1, amt')).toEqual([[40], [10], [25], [5], [20]]);
  });

  it("by an expression's collation", () => {
    expect(all('SELECT DISTINCT ON (shop COLLATE NOCASE) shop, day FROM r ORDER BY shop COLLATE NOCASE, day')).toEqual([['a', 1], ['b', 1]]);
  });

  it('with LIMIT, and in a subquery', () => {
    expect(all('SELECT DISTINCT ON (shop) shop, amt FROM r ORDER BY shop, amt DESC LIMIT 2')).toEqual([['B', 40], ['a', 30]]);
    expect(all('SELECT sum(amt) FROM (SELECT DISTINCT ON (shop) shop, amt FROM r ORDER BY shop, amt DESC)')).toEqual([[90]]);
  });

  it('plain DISTINCT is unchanged', () => {
    expect(all('SELECT DISTINCT shop FROM r ORDER BY shop')).toEqual([['B'], ['a'], ['b']]);
  });
});
