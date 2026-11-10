import type { Category, CategoryRule } from '@/lib/types';

export interface RuleGroup {
  category: Category;
  rules: CategoryRule[];
  // Transactions categorised by the group's rules.
  matches: number;
}

/**
 * Groups rules by category, in the order of `categories`. Categories without rules are left out.
 *
 * @param rules - The rules to group.
 * @param categories - The known categories, which set the group order.
 * @returns One group per category that has rules, with the summed match count.
 * @example
 * groupRulesByCategory(rules, CATEGORIES);
 * // [{ category: { key: 'food', label: 'Food' }, rules: [...], matches: 174 }]
 */
export function groupRulesByCategory(rules: CategoryRule[], categories: Category[]): RuleGroup[] {
  return categories
    .map((category) => {
      const inCategory = rules.filter(rule => rule.categoryKey === category.key);

      return {
        category,
        rules: inCategory,
        matches: inCategory.reduce((sum, rule) => sum + rule.matches, 0),
      };
    })
    .filter(group => group.rules.length > 0);
}
