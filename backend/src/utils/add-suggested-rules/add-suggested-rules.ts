import type { Db } from '../../db';
import { findWinningRule } from '@money-tracker/shared';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { MAX_UPDATE_IDS, SUGGESTED_RULES } from '../../constants';
import { categoryRules, transactions } from '../../db/schema';
import { isDuplicate } from '../is-duplicate/is-duplicate';
import { loadRules } from '../load-rules/load-rules';

// D1 allows at most 100 bound parameters per statement; a rule row binds 6.
const RULE_INSERT_CHUNK_SIZE = 15;

type Statement = Parameters<Db['batch']>[0][number];

function batch(db: Db, statements: Statement[]): Promise<unknown> {
  return db.batch(statements as [Statement, ...Statement[]]);
}

/**
 * Adds the suggested rules the user doesn't have yet and applies them.
 *
 * Suggestions that duplicate an existing rule (same pattern and operator) are
 * skipped. Applying categorises existing transactions the new rules win,
 * leaving manual overrides and anything an existing rule wins alone.
 *
 * @param db - The database.
 * @param userId - The user to add the rules for.
 * @returns How many rules were created and how many transactions changed category.
 * @example
 * const { created, updated } = await addSuggestedRules(db, 'user-1');
 */
export async function addSuggestedRules(db: Db, userId: string): Promise<{ created: number; updated: number }> {
  const existing = await loadRules(db, userId);
  const now = new Date();
  const fresh = SUGGESTED_RULES
    .filter(rule => !isDuplicate(existing, rule.pattern, rule.operator))
    .map(rule => ({ ...rule, id: crypto.randomUUID(), userId, createdAt: now }));

  if (fresh.length === 0)
    return { created: 0, updated: 0 };

  const inserts: Statement[] = [];

  for (let i = 0; i < fresh.length; i += RULE_INSERT_CHUNK_SIZE)
    inserts.push(db.insert(categoryRules).values(fresh.slice(i, i + RULE_INSERT_CHUNK_SIZE)));

  await batch(db, inserts);

  const freshIds = new Set(fresh.map(rule => rule.id));
  const allRules = [...existing, ...fresh];
  const rows = await db
    .select({ id: transactions.id, description: transactions.description, category: transactions.category })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), ne(transactions.categorySource, 'manual')));

  const idsByCategory = new Map<string, string[]>();

  for (const row of rows) {
    const winner = findWinningRule(row.description, allRules);

    if (winner && freshIds.has(winner.id) && winner.category !== row.category)
      idsByCategory.set(winner.category, [...idsByCategory.get(winner.category) ?? [], row.id]);
  }

  const updates: Statement[] = [];

  for (const [category, ids] of idsByCategory) {
    for (let i = 0; i < ids.length; i += MAX_UPDATE_IDS) {
      updates.push(
        db
          .update(transactions)
          .set({ category, categorySource: 'rule' })
          .where(and(eq(transactions.userId, userId), inArray(transactions.id, ids.slice(i, i + MAX_UPDATE_IDS)))),
      );
    }
  }

  if (updates.length > 0)
    await batch(db, updates);

  return { created: fresh.length, updated: [...idsByCategory.values()].reduce((sum, ids) => sum + ids.length, 0) };
}
