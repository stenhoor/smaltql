// smaltdb ADR 0022 step 7: PIVOT.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.prepare('CREATE TABLE s(shop TEXT, month TEXT, amt INTEGER)').run();
  d.prepare("INSERT INTO s VALUES ('a', 'jan', 10), ('a', 'feb', 20), ('a', 'jan', 5), ('b', 'feb', 7)").run();
  return d;
}
const q = (sql: string) => {
  const st = db().prepare(sql);
  return { rows: st.all(), cols: st.columns.map((c: { name: string } | string) => (typeof c === 'string' ? c : c.name)) };
};

describe('PIVOT (ADR 0022 step 7)', () => {
  it('one column per value, grouped by the other columns; a cell with no rows is NULL', () => {
    const r = q("SELECT * FROM s PIVOT (sum(amt) FOR month IN ('jan', 'feb')) ORDER BY shop");
    expect(r.cols).toEqual(['shop', 'jan', 'feb']);
    expect(r.rows).toEqual([['a', 15, 20], ['b', null, 7]]);
  });

  it('several aggregates, with aliases', () => {
    const r = q("SELECT * FROM s PIVOT (sum(amt) AS total, count(*) AS n FOR month IN ('jan' AS j, 'feb' AS f)) AS p ORDER BY p.shop");
    expect(r.cols).toEqual(['shop', 'j_total', 'j_n', 'f_total', 'f_n']);
    expect(r.rows).toEqual([['a', 15, 2, 20, 1], ['b', null, 0, 7, 1]]);
  });

  it('of a subquery', () => {
    expect(q("SELECT jan FROM (SELECT month, amt FROM s) PIVOT (max(amt) FOR month IN ('jan'))").rows).toEqual([[10]]);
  });

  it('errors, and pivot as an alias', () => {
    expect(() => q("SELECT * FROM s PIVOT (sum(amt) FOR mon IN ('jan'))")).toThrow(/no such column: mon/);
    expect(() => q("SELECT * FROM s PIVOT (upper(shop) FOR month IN ('jan'))")).toThrow(/aggregate/);
    expect(() => q('SELECT * FROM s PIVOT (sum(amt) FOR month IN (shop))')).toThrow(/constants/);
    expect(q("SELECT pivot.shop FROM s pivot WHERE pivot.amt = 7").rows).toEqual([['b']]);
  });
});
