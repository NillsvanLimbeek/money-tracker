import type { Category, CategoryRule, RuleOperator } from '../../types';
import { normalise } from '@money-tracker/shared';
import { MIN_PATTERN_LENGTH, RULE_OPERATORS } from '../../constants';

export interface RuleValidation {
  // An error blocks saving, a warning only informs.
  level: 'error' | 'warning' | null;
  message: string | null;
  canSave: boolean;
}

/**
 * Validates the pattern of a rule that is being created.
 *
 * @param draft - The rule being entered.
 * @param draft.pattern - The pattern text.
 * @param draft.operator - How the pattern is compared with a description.
 * @param rules - The user's existing rules, to detect a duplicate.
 * @param categories - The known categories, to name the category of a duplicate.
 * @param distinctMatches - How many different descriptions the draft matches, or undefined while still loading.
 * @returns The strongest problem found, and whether the rule can be saved.
 * @example
 * validateRule({ pattern: 'ah', operator: 'contains' }, rules, CATEGORIES, 4);
 * // { level: 'warning', message: 'Very short pattern — “ah” matches 4 different descriptions. Make it more specific.', canSave: true }
 */
export function validateRule(
  draft: { pattern: string; operator: RuleOperator },
  rules: CategoryRule[],
  categories: Category[],
  distinctMatches?: number,
): RuleValidation {
  const pattern = normalise(draft.pattern);

  if (pattern === '')
    return { level: 'error', message: 'Enter a pattern to match.', canSave: false };

  const duplicate = rules.find(rule => rule.operator === draft.operator && normalise(rule.pattern) === pattern);

  if (duplicate) {
    const category = categories.find(item => item.key === duplicate.categoryKey)?.label ?? duplicate.categoryKey;

    return {
      level: 'error',
      message: `This rule already exists: ${RULE_OPERATORS[duplicate.operator].label} “${duplicate.pattern}” → ${category}.`,
      canSave: false,
    };
  }

  if (pattern.length < MIN_PATTERN_LENGTH) {
    const matches = distinctMatches === undefined ? 'many different descriptions' : `${distinctMatches} different ${distinctMatches === 1 ? 'description' : 'descriptions'}`;

    return { level: 'warning', message: `Very short pattern — “${pattern}” matches ${matches}. Make it more specific.`, canSave: true };
  }

  return { level: null, message: null, canSave: true };
}
