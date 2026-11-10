// smaltdb ADR 0022 step 7: TABLESAMPLE.
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';

function db(): Database {
  const d = Database.openMemory();
  d.prepare('CREATE TABLE t(i INTEGER)').run();
  d.prepare('WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 100) INSERT INTO t SELECT i FROM n').run();
  return d;
}

describe('TABLESAMPLE (ADR 0022 step 7)', () => {
  it('draws that percent of the rows, in their order', () => {
    const rows = db().prepare('SELECT i FROM t TABLESAMPLE BERNOULLI (10) REPEATABLE (1)').all().map((r) => r[0] as number);
    expect(rows).toHaveLength(10);
    expect([...rows].sort((a, b) => a - b)).toEqual(rows);
  });

  it('the same seed draws the same rows; SYSTEM is the same', () => {
    const d = db();
    const a = d.prepare('SELECT i FROM t TABLESAMPLE BERNOULLI (20) REPEATABLE (7)').all();
    expect(d.prepare('SELECT i FROM t TABLESAMPLE SYSTEM (20) REPEATABLE (7)').all()).toEqual(a);
  });

  it('100 percent is every row, 0 none', () => {
    const d = db();
    expect(d.prepare('SELECT count(*) FROM t TABLESAMPLE BERNOULLI (100)').all()).toEqual([[100]]);
    expect(d.prepare('SELECT count(*) FROM t TABLESAMPLE BERNOULLI (0)').all()).toEqual([[0]]);
  });

  it('after an alias, and under a WHERE and a join', () => {
    const d = db();
    expect(d.prepare('SELECT count(*) FROM t AS x TABLESAMPLE BERNOULLI (50) REPEATABLE (3) WHERE x.i > 0').all()).toEqual([[50]]);
    expect(d.prepare('SELECT count(*) FROM t s TABLESAMPLE BERNOULLI (10) REPEATABLE (3) JOIN t u ON s.i = u.i').all()).toEqual([[10]]);
  });

  it('REPEATABLE takes an integer', () => {
    expect(() => db().prepare("SELECT i FROM t TABLESAMPLE BERNOULLI (10) REPEATABLE ('x')").all()).toThrow(/REPEATABLE takes an integer/);
  });

  it('tablesample is still an alias where no sampling method follows', () => {
    expect(db().prepare('SELECT tablesample.i FROM t tablesample WHERE i = 1').all()).toEqual([[1]]);
  });
});
