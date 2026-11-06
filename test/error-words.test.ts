/**
 * SQL words the engine's errors as SQLite does (smaltdb ADR 0016 section 10): from an error's fields, SQLite's text for
 * every constraint, where the engine's own message is worded in its neutral terms.
 */
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';
import type { ErrorToWord } from 'smaltdb/language';
import { sqlLanguage } from '../src/index.js';
import { sqlErrorMessage } from '../src/errors.js';

describe('SQL error messages', () => {
  it('word every constraint failure as SQLite does', () => {
    const seen: { engine: string; sql: string | undefined; error: ErrorToWord }[] = [];
    const lang = sqlLanguage as { errorMessage?: (e: ErrorToWord) => string | undefined };
    const words = lang.errorMessage!;
    lang.errorMessage = (e) => {
      const sql = words(e);
      seen.push({ engine: e.message, sql, error: e });
      return sql;
    };
    try {
      const db = Database.openMemory();
      db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE p(id INTEGER PRIMARY KEY, code TEXT NOT NULL, a INT, b INT, UNIQUE (a, b), CONSTRAINT positive CHECK (a > 0), CHECK (b < 100));
        CREATE UNIQUE INDEX p_lower ON p(lower(code));
        CREATE TABLE k(x TEXT, y TEXT, PRIMARY KEY (x, y));
        CREATE TABLE c(id INTEGER PRIMARY KEY, pid INT REFERENCES p(id));
        INSERT INTO p VALUES (1, 'x', 1, 1);
        INSERT INTO k VALUES ('a', 'b');
        INSERT INTO c VALUES (1, 1);
      `);
      const failing: [string, string][] = [
        ["INSERT INTO p VALUES (2, NULL, 2, 2)", 'NOT NULL constraint failed: p.code'],
        ["INSERT INTO p VALUES (2, 'y', 1, 1)", 'UNIQUE constraint failed: p.a, p.b'],
        ["INSERT INTO p VALUES (1, 'y', 3, 3)", 'UNIQUE constraint failed: p.id'],
        ["INSERT INTO p VALUES (2, 'X', 3, 3)", "UNIQUE constraint failed: index 'p_lower'"],
        ["INSERT INTO k VALUES ('a', 'b')", 'UNIQUE constraint failed: k.x, k.y'],
        ["INSERT INTO p VALUES (2, 'y', -1, 3)", 'CHECK constraint failed: positive'],
        ["INSERT INTO p VALUES (2, 'y', 3, 300)", 'CHECK constraint failed: b < 100'],
        ['INSERT INTO c VALUES (2, 99)', 'FOREIGN KEY constraint failed'],
        ['DELETE FROM p WHERE id = 1', 'FOREIGN KEY constraint failed'],
      ];
      for (const [sql, message] of failing) expect(() => db.exec(sql), sql).toThrow(message);
      expect(seen.map((s) => s.sql)).toEqual(failing.map(([, message]) => message));
      // SQL leaves a column type failure in the engine's words.
      seen.length = 0;
      expect(() => db.exec("INSERT INTO p VALUES (2, 'y', 'many', 3)")).toThrow(/cannot store TEXT value in INTEGER column p\.a/);
      expect(seen.map((s) => [s.sql, s.error.constraint])).toEqual([[undefined, 'datatype']]);
    } finally {
      lang.errorMessage = words;
    }
  });

  it('keeps the engine\'s message where the fields do not say enough', () => {
    expect(sqlErrorMessage({ code: 'SMALT_CONSTRAINT_NOTNULL', message: 'm', constraint: 'notNull' })).toBeUndefined();
    expect(sqlErrorMessage({ code: 'SMALT_ERROR', message: 'no such table: t' })).toBeUndefined();
  });
});
