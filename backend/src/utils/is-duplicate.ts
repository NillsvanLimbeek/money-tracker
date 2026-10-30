import type { CategoryRuleRow } from './category-rule-row';
import { normalise } from '@money-tracker/shared';

export function isDuplicate(rules: CategoryRuleRow[], pattern: string, operator: string, exceptId?: string): boolean {
  return rules.some(rule => rule.id !== exceptId && rule.operator === operator && normalise(rule.pattern) === normalise(pattern));
}
