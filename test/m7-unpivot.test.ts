// smaltdb ADR 0022 step 7: UNPIVOT.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.prepare('CREATE TABLE sales(shop TEXT, jan INTEGER, feb INTEGER)').run();
  d.prepare("INSERT INTO sales VALUES ('a', 10, 20), ('b', NULL, 5)").run();
  return d;
}
const all = (sql: string): unknown[][] => db().prepare(sql).all();

describe('UNPIVOT (ADR 0022 step 7)', () => {
  it('one row per row and column, NULL values left out', () => {
    expect(all('SELECT shop, month, amt FROM sales UNPIVOT (amt FOR month IN (jan, feb))')).toEqual([
      ['a', 'jan', 10],
      ['a', 'feb', 20],
      ['b', 'feb', 5],
    ]);
  });

  it('INCLUDE NULLS keeps them; labels name the columns', () => {
    expect(all("SELECT * FROM sales UNPIVOT INCLUDE NULLS (amt FOR month IN (jan AS 'January', feb AS 'February')) AS u WHERE u.shop = 'b'")).toEqual([
      ['b', 'January', null],
      ['b', 'February', 5],
    ]);
  });

  it('of a subquery, aggregated after', () => {
    expect(all('SELECT month, sum(amt) FROM (SELECT * FROM sales) UNPIVOT (amt FOR month IN (jan, feb)) GROUP BY month ORDER BY month')).toEqual([
      ['feb', 25],
      ['jan', 10],
    ]);
  });

  it('errors, and unpivot as an alias', () => {
    expect(() => all('SELECT * FROM sales UNPIVOT (amt FOR month IN (mar))')).toThrow(/no such column: mar/);
    expect(all("SELECT unpivot.shop FROM sales unpivot WHERE unpivot.shop = 'a'")).toEqual([['a']]);
  });
});
