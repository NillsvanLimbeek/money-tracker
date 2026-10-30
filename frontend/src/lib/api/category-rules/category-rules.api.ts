import type { CategoryRule, NewCategoryRule, RuleOperator, RulePreview } from '../../types';
import { del, get, post } from '../client/fetch';

/**
 * Fetches the user's category rules.
 *
 * @returns The rules, each with how many transactions it currently matches.
 * @example
 * const rules = await getCategoryRules();
 */
export async function getCategoryRules(): Promise<CategoryRule[]> {
  return await get('/api/category-rules');
}

/**
 * Deletes one category rule. Transactions it categorised keep their category.
 *
 * @param id - The rule id.
 * @example
 * await deleteCategoryRule('abc');
 */
export async function deleteCategoryRule(id: string): Promise<void> {
  await del(`/api/category-rules/${id}`);
}

/**
 * Creates a category rule.
 *
 * @param rule - The pattern, operator and category key of the new rule.
 * @returns The created rule. Rejects with a 409 when the pattern and operator already exist.
 * @example
 * const rule = await createCategoryRule({ pattern: 'ziggo', operator: 'contains', category: 'housing' });
 */
export async function createCategoryRule(rule: NewCategoryRule): Promise<CategoryRule> {
  return await post('/api/category-rules', rule);
}

/**
 * Applies a rule to the user's existing transactions, skipping manual overrides.
 *
 * @param id - The rule id.
 * @returns How many transactions changed category.
 * @example
 * const { updated } = await applyCategoryRule('abc');
 */
export async function applyCategoryRule(id: string): Promise<{ updated: number }> {
  return await post(`/api/category-rules/${id}/apply`, undefined);
}

/**
 * Previews a rule that is not saved yet.
 *
 * @param pattern - The pattern to test.
 * @param operator - How the pattern is compared with a description.
 * @returns The matching transaction count and the distinct descriptions, most frequent first.
 * @example
 * const { count, descriptions } = await previewCategoryRule('ah', 'contains');
 */
export async function previewCategoryRule(pattern: string, operator: RuleOperator): Promise<RulePreview> {
  return await get('/api/category-rules/preview', { pattern, operator });
}
