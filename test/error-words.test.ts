/**
 * SQL words the engine's errors as SQLite does (smaltdb ADR 0016 section 10): from an error's fields, the same text the
 * engine's own message gave, for every constraint.
 */
import { describe, expect, it } from 'vitest';
import { Database } from 'smaltdb/engine';
import type { ErrorToWord } from 'smaltdb/language';
import { sqlLanguage } from '../src/index.js';
import { sqlErrorMessage } from '../src/errors.js';

describe('SQL error messages', () => {
  it("word every constraint failure as the engine's message did", () => {
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
      const failing = [
        "INSERT INTO p VALUES (2, NULL, 2, 2)",
        "INSERT INTO p VALUES (2, 'y', 1, 1)",
        "INSERT INTO p VALUES (1, 'y', 3, 3)",
        "INSERT INTO p VALUES (2, 'X', 3, 3)",
        "INSERT INTO k VALUES ('a', 'b')",
        "INSERT INTO p VALUES (2, 'y', -1, 3)",
        "INSERT INTO p VALUES (2, 'y', 3, 300)",
        'INSERT INTO c VALUES (2, 99)',
        'DELETE FROM p WHERE id = 1',
        "INSERT INTO p VALUES (2, 'y', 'many', 3)",
      ];
      for (const sql of failing) expect(() => db.exec(sql), sql).toThrow();
      expect(seen).toHaveLength(failing.length);
      for (const s of seen) {
        // Worded where SQL words it, and then exactly as the engine did; the engine's words otherwise.
        if (s.sql !== undefined) expect(s.sql, s.engine).toBe(s.engine);
      }
      expect(seen.filter((s) => s.sql === undefined).map((s) => s.error.constraint)).toEqual(['datatype']);
    } finally {
      lang.errorMessage = words;
    }
  });

  it('keeps the engine\'s message where the fields do not say enough', () => {
    expect(sqlErrorMessage({ code: 'SMALT_CONSTRAINT_NOTNULL', message: 'm', constraint: 'notNull' })).toBeUndefined();
    expect(sqlErrorMessage({ code: 'SMALT_ERROR', message: 'no such table: t' })).toBeUndefined();
  });
});
