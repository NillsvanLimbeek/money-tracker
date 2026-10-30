import type { MatchableRule } from '@money-tracker/shared';
import type { CategoryRuleRow } from './category-rule-row';
import { ruleMatches } from '@money-tracker/shared';

/**
 * Shapes a stored rule for the API, with how many of the given descriptions it matches.
 *
 * @param rule - The stored rule.
 * @param descriptions - The user's transaction descriptions.
 * @returns The rule as the frontend expects it.
 * @example
 * toApiRule(rule, ['Albert Heijn 1', 'Netflix']); // { id, pattern, operator, categoryKey, matches: 1 }
 */
export function toApiRule(rule: CategoryRuleRow, descriptions: string[]): { id: string; pattern: string; operator: MatchableRule['operator']; categoryKey: string; matches: number } {
  return {
    id: rule.id,
    pattern: rule.pattern,
    operator: rule.operator,
    categoryKey: rule.category,
    matches: descriptions.filter(description => ruleMatches(description, rule)).length,
  };
}
