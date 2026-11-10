import type { CategoryRule } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { groupRulesByCategory } from './group-rules-by-category';

const categories = [{ key: 'food', label: 'Food' }, { key: 'housing', label: 'Housing' }, { key: 'other', label: 'Other' }];

function rule(id: string, categoryKey: string, matches: number): CategoryRule {
  return { id, pattern: id, operator: 'contains', categoryKey, matches };
}

describe('groupRulesByCategory', () => {
  it('groups in category order, sums matches and skips empty categories', () => {
    const groups = groupRulesByCategory([rule('a', 'housing', 12), rule('b', 'food', 9), rule('c', 'housing', 3)], categories);

    expect(groups.map(group => group.category.key)).toEqual(['food', 'housing']);
    expect(groups[1]?.rules.map(item => item.id)).toEqual(['a', 'c']);
    expect(groups[1]?.matches).toBe(15);
  });

  it('returns no groups without rules', () => {
    expect(groupRulesByCategory([], categories)).toEqual([]);
  });
});
