import type { Category, CategoryRule, RuleOperator } from '@/lib/types';
import { normalise } from '@money-tracker/shared';
import { m } from '@/paraglide/messages';
import { MIN_PATTERN_LENGTH, RULE_OPERATORS } from '../../constants';

export interface RuleValidation {
  // An error blocks saving, a warning only informs.
  level: 'error' | 'warning' | null;
  message: string | null;
  canSave: boolean;
  // Id of the existing rule that makes this draft a duplicate.
  duplicateId?: string;
}

/**
 * Validates the pattern of a rule that is being created or edited.
 *
 * @param draft - The rule being entered.
 * @param draft.pattern - The pattern text.
 * @param draft.operator - How the pattern is compared with a description.
 * @param rules - The user's existing rules, to detect a duplicate.
 * @param categories - The known categories, to name the category of a duplicate.
 * @param distinctMatches - How many different descriptions the draft matches, or undefined while still loading.
 * @param ignoreId - Id of the rule being edited, so it does not count as its own duplicate.
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
  ignoreId?: string,
): RuleValidation {
  const pattern = normalise(draft.pattern);

  if (pattern === '')
    return { level: 'error', message: m.rule_validation_required(), canSave: false };

  const duplicate = rules.find(rule => rule.id !== ignoreId && rule.operator === draft.operator && normalise(rule.pattern) === pattern);

  if (duplicate) {
    const category = categories.find(item => item.key === duplicate.categoryKey)?.label ?? duplicate.categoryKey;

    return {
      level: 'error',
      message: m.rule_validation_duplicate({ operator: RULE_OPERATORS[duplicate.operator].label, pattern: duplicate.pattern, category }),
      canSave: false,
      duplicateId: duplicate.id,
    };
  }

  if (pattern.length < MIN_PATTERN_LENGTH) {
    const matches = distinctMatches === undefined ? m.rule_validation_many() : m.rule_validation_descriptions({ count: distinctMatches });

    return { level: 'warning', message: m.rule_validation_short({ pattern, matches }), canSave: true };
  }

  return { level: null, message: null, canSave: true };
}
