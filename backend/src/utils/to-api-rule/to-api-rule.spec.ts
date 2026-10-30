import { describe, expect, it } from 'vitest';
import { createRule } from '../category-rule-row/category-rule-row.fixture';
import { toApiRule } from './to-api-rule';

describe('toApiRule', () => {
  it('maps the stored rule to the API shape', () => {
    expect(toApiRule(createRule(), [])).toEqual({
      id: 'rule-1',
      pattern: 'albert heijn',
      operator: 'contains',
      categoryKey: 'food',
      matches: 0,
    });
  });

  it('counts the descriptions the rule matches', () => {
    const descriptions = ['Albert Heijn 1234', 'ALBERT HEIJN 9', 'Netflix'];

    expect(toApiRule(createRule(), descriptions).matches).toBe(2);
  });
});
