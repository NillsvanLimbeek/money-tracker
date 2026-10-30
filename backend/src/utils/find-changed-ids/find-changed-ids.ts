import type { Db } from '../../db';
import type { CategoryRuleRow } from '../category-rule-row/category-rule-row';
import { findWinningRule } from '@money-tracker/shared';
import { and, eq, ne } from 'drizzle-orm';
import { transactions } from '../../db/schema';

// Transactions the rule would change: not set by hand, won by this rule, and not already in its category.
export async function findChangedIds(db: Db, userId: string, rule: CategoryRuleRow, rules: CategoryRuleRow[]): Promise<string[]> {
  const rows = await db
    .select({ id: transactions.id, description: transactions.description, category: transactions.category })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), ne(transactions.categorySource, 'manual')));

  return rows
    .filter(row => findWinningRule(row.description, rules)?.id === rule.id && row.category !== rule.category)
    .map(row => row.id);
}
