import type { MatchableRule } from '@money-tracker/shared';
import type { Db } from '../../db';
import { normalise, ruleMatches } from '@money-tracker/shared';
import { desc, eq } from 'drizzle-orm';
import { transactions } from '../../db/schema';

export interface RuleMatchGroup {
  description: string;
  // How many transactions share this description.
  count: number;
  // Date and amount of the newest of those transactions.
  date: string;
  amountCents: number;
}

/**
 * Finds the user's transactions a rule would match, grouped by description.
 *
 * @param db - The database.
 * @param userId - The owner of the transactions.
 * @param rule - The rule to test, saved or not.
 * @returns One group per distinct description, most frequent first.
 * @example
 * await previewRuleMatches(db, 'alice', { pattern: 'ah', operator: 'contains' });
 * // [{ description: 'AH to go 5821', count: 19, date: '2026-10-23', amountCents: -685 }]
 */
export async function previewRuleMatches(db: Db, userId: string, rule: Pick<MatchableRule, 'pattern' | 'operator'>): Promise<RuleMatchGroup[]> {
  const rows = await db
    .select({ description: transactions.description, date: transactions.date, amountCents: transactions.amountCents })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));

  const groups = new Map<string, RuleMatchGroup>();

  for (const row of rows) {
    if (!ruleMatches(row.description, rule))
      continue;

    const key = normalise(row.description);
    const group = groups.get(key);

    // Rows arrive newest first, so the first one seen supplies date and amount.
    if (group)
      group.count++;
    else
      groups.set(key, { ...row, count: 1 });
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}
