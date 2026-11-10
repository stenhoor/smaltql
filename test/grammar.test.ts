/**
 * docs/grammar.ebnf is the grammar the syntax diagrams and the agent guide show. This test keeps it honest: it derives
 * random statements from every statement rule and checks that the parser accepts each one, so the grammar never
 * shows a form smaltql can't read. (It checks the parse only: a statement can still fail to bind, as `SELECT nope`
 * does.)
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseEbnf, type Node } from '../docs/.vitepress/theme/railroad';
import { parse } from '../src/parser.js';

const grammar = parseEbnf(readFileSync(new URL('../docs/grammar.ebnf', import.meta.url), 'utf8'));

// Tokens: the grammar's leaves, with values the lexer reads as what they name.
const TOKENS: Record<string, string[]> = {
  name: ['a', 'b', 't', 'x1', '"quoted name"'],
  'string-literal': ["'s'", "'it''s'"],
  'numeric-literal': ['1', '2.5', '0x10'],
  'blob-literal': ["x'0A'"],
  parameter: ['?', '?2', ':p', '@p', '$p'],
};

/** A deterministic random source, so a failure can be reproduced. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** The fewest tokens each rule can produce, to end recursion. */
const cost = new Map<string, number>();
function minCost(n: Node): number {
  switch (n.t) {
    case 'term':
      return 1;
    case 'ref':
      return TOKENS[n.name] ? 1 : (cost.get(n.name) ?? 1e6);
    case 'seq':
      return n.items.reduce((a, i) => a + minCost(i), 0);
    case 'choice':
      return Math.min(...n.items.map(minCost));
    case 'opt':
    case 'skip':
      return 0;
    case 'rep':
      return minCost(n.item);
  }
}
for (let changed = true; changed; ) {
  changed = false;
  for (const [name, rule] of grammar.rules) {
    const c = minCost(rule);
    if (c < (cost.get(name) ?? 1e6)) {
      cost.set(name, c);
      changed = true;
    }
  }
}

const ATOMIC_EXPR = 2; // alternatives of expr before this index are atoms; the rest are wrapped in parentheses

function generate(name: string, random: () => number, depth = 0): string {
  if (TOKENS[name]) return TOKENS[name][Math.floor(random() * TOKENS[name].length)];
  const rule = grammar.rules.get(name);
  if (!rule) throw new Error(`no rule ${name}`);
  const deep = depth > 4;
  const out: string[] = [];
  const walk = (n: Node, top: boolean): void => {
    switch (n.t) {
      case 'term':
        out.push(n.text);
        return;
      case 'ref':
        out.push(generate(n.name, random, depth + 1));
        return;
      case 'seq':
        n.items.forEach((i) => walk(i, false));
        return;
      case 'choice': {
        const pick = deep ? n.items.reduce((best, i) => (minCost(i) < minCost(best) ? i : best)) : n.items[Math.floor(random() * n.items.length)];
        const index = n.items.indexOf(pick);
        // An expression built from smaller ones is wrapped in parentheses, so where it sits never changes how it
        // parses (precedence is the operators' table, not the grammar's).
        if (name === 'expr' && top && index >= ATOMIC_EXPR && depth > 0) {
          out.push('(');
          walk(pick, false);
          out.push(')');
        } else walk(pick, false);
        return;
      }
      case 'opt':
        if (!deep && random() < 0.4) walk(n.item, false);
        return;
      case 'rep': {
        const times = deep ? 1 : 1 + Math.floor(random() * 3);
        for (let i = 0; i < times; i++) {
          if (i && n.sep) walk(n.sep, false);
          walk(n.item, false);
        }
        return;
      }
      case 'skip':
        return;
    }
  };
  walk(rule, true);
  // `ARRAY[` is one token pair: with a space, `[` starts a bracket-quoted name, as in SQLite.
  return out.join(' ').replace(/\bARRAY \[/g, 'ARRAY[');
}

describe('docs/grammar.ebnf', () => {
  it('defines every rule it uses, but the tokens', () => {
    const missing = new Set<string>();
    const visit = (n: Node): void => {
      if (n.t === 'ref' && !grammar.rules.has(n.name) && !TOKENS[n.name]) missing.add(n.name);
      if (n.t === 'seq' || n.t === 'choice') n.items.forEach(visit);
      if (n.t === 'opt' || n.t === 'rep') visit(n.item);
      if (n.t === 'rep' && n.sep) visit(n.sep);
    };
    grammar.rules.forEach(visit);
    expect([...missing]).toEqual([]);
  });

  const statements = (grammar.rules.get('sql-stmt') as Extract<Node, { t: 'choice' }>).items.map((i) => (i as { name: string }).name);
  it.each(statements)('every %s it can produce, the parser reads', (rule) => {
    const random = rng(rule.length * 7919);
    const rejected: string[] = [];
    for (let i = 0; i < 400; i++) {
      const sql = generate(rule, random);
      try {
        parse(sql);
      } catch (e) {
        rejected.push(`${sql}\n    → ${(e as Error).message}`);
      }
    }
    // The shortest few say most about which rule is wrong.
    rejected.sort((a, b) => a.length - b.length);
    expect(rejected.slice(0, 3), `${rule}: statements the grammar produces and the parser rejects`).toEqual([]);
  });
});
