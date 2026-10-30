import type { CategoryRule } from '../../types';
import { del, get } from '../client/fetch';

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
