/**
 * What SQL gives for smaltdb's bool and NaN (smaltdb ADR 0018): comparisons and logic are INTEGER 0 / 1, declared int
 * on every plan node smaltql builds, so they stay 0 / 1 when the engine's own defaults become bool; a NaN parameter
 * binds as NULL, as SQLite binds it (the language's `parameter` hook); a NaN another language stored reads as NaN.
 */
import { describe, expect, it } from 'vitest';
import { Database, plan as p } from 'smaltdb/engine';
import { sqlLanguage } from '../src/index.js';

describe('bool and NaN in SQL', () => {
  it('comparisons and logic are 0 / 1, typed int', () => {
    const db = Database.openMemory();
    const st = db.prepare("SELECT 1 = 1, 1 < 0, NOT 0, 1 AND 0, 0 OR 1, NULL IS NULL, 2 BETWEEN 1 AND 3, 2 IN (1, 2), 'ab' LIKE 'a%', 'x' GLOB 'y'");
    expect(st.all()).toEqual([[1, 0, 1, 0, 1, 1, 1, 1, 1, 0]]);
    expect(st.columnTypes).toEqual(Array(10).fill('int'));
  });

  it('nested logic, filtered by a predicate, is 0 / 1', () => {
    const db = Database.openMemory();
    db.exec('CREATE TABLE t(a INT, b INT); INSERT INTO t VALUES (1, NULL), (5, 5)');
    expect(db.query('SELECT NOT (a = 1 AND b IS NULL OR a BETWEEN 1 AND 2) FROM t ORDER BY a').rows).toEqual([[0], [1]]);
  });

  it('a NaN parameter binds as NULL', () => {
    const db = Database.openMemory();
    expect(db.query('SELECT ?, ? IS NULL', [NaN, NaN]).rows).toEqual([[null, 1]]);
    expect(sqlLanguage.parameter!(NaN)).toBeNull();
    expect(sqlLanguage.parameter!(1.5)).toBe(1.5);
  });

  it('a NaN stored by another language reads as NaN', () => {
    const db = Database.openMemory();
    db.exec('CREATE TABLE r(x REAL)');
    db.queryPlan({ kind: 'write', plan: p.append('r', p.fromColumns([new Float64Array([NaN, 1])], ['real']), [0]) });
    const rows = db.query('SELECT x FROM r ORDER BY x').rows;
    expect(rows[0]).toEqual([1]);
    expect(Number.isNaN(rows[1][0] as number)).toBe(true);
  });
});
