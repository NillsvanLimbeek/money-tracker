import type { CategoryRuleRow } from './category-rule-row';

export function createRule(overrides: Partial<CategoryRuleRow> = {}): CategoryRuleRow {
  return {
    id: 'rule-1',
    userId: 'user-1',
    pattern: 'albert heijn',
    operator: 'contains',
    category: 'food',
    createdAt: new Date(2026, 0, 1),
    ...overrides,
  };
}
