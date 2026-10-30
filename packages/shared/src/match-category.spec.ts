import type { MatchableRule } from './match-category';
import { describe, expect, it } from 'vitest';
import { findWinningRule, matchCategory, normalise, ruleMatches } from './match-category';

function rule(pattern: string, operator: MatchableRule['operator'], day = 1, category = 'food'): MatchableRule & { category: string } {
  return { pattern, operator, createdAt: new Date(2026, 0, day), category };
}

describe('normalise', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalise('  Albert   HEIJN ')).toBe('albert heijn');
  });
});

describe('ruleMatches', () => {
  it('supports every operator, case-insensitively', () => {
    expect(ruleMatches('Albert Heijn 1234', rule('ALBERT', 'startsWith'))).toBe(true);
    expect(ruleMatches('Albert Heijn 1234', rule('1234', 'endsWith'))).toBe(true);
    expect(ruleMatches('Albert Heijn 1234', rule('heijn', 'contains'))).toBe(true);
    expect(ruleMatches('Albert Heijn', rule('albert  heijn', 'equals'))).toBe(true);
  });

  it('does not match when the operator fails', () => {
    expect(ruleMatches('Albert Heijn 1234', rule('heijn', 'startsWith'))).toBe(false);
    expect(ruleMatches('Albert Heijn 1234', rule('albert', 'equals'))).toBe(false);
  });

  it('never matches an empty pattern', () => {
    expect(ruleMatches('Albert Heijn', rule('  ', 'contains'))).toBe(false);
  });
});

describe('findWinningRule', () => {
  it('prefers the stronger operator', () => {
    const equals = rule('albert heijn', 'equals');

    expect(findWinningRule('Albert Heijn', [rule('albert heijn', 'startsWith'), equals, rule('albert', 'contains')])).toBe(equals);
  });

  it('prefers the longer pattern at equal strength', () => {
    const longer = rule('albert heijn', 'contains');

    expect(findWinningRule('Albert Heijn 1234', [rule('albert', 'contains'), longer])).toBe(longer);
  });

  it('prefers the older rule when everything else ties', () => {
    const older = rule('albert', 'contains', 1);

    expect(findWinningRule('Albert Heijn', [rule('Albert', 'contains', 3), older])).toBe(older);
  });

  it('returns null when nothing matches', () => {
    expect(findWinningRule('Netflix', [rule('albert', 'contains')])).toBeNull();
  });
});

describe('matchCategory', () => {
  it('returns the winning rule\'s category or null', () => {
    const rules = [rule('albert', 'contains', 1, 'food'), rule('albert heijn', 'contains', 2, 'shopping')];

    expect(matchCategory('Albert Heijn', rules)).toBe('shopping');
    expect(matchCategory('Netflix', rules)).toBeNull();
  });
});
