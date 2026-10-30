import type { Db } from '../../db';
import type { CategoryRuleRow } from '../category-rule-row/category-rule-row';
import { asc, eq } from 'drizzle-orm';
import { categoryRules } from '../../db/schema';

export async function loadRules(db: Db, userId: string): Promise<CategoryRuleRow[]> {
  return await db
    .select()
    .from(categoryRules)
    .where(eq(categoryRules.userId, userId))
    .orderBy(asc(categoryRules.createdAt), asc(categoryRules.id));
}
