import type { CategoryRule, ImportRow, Transaction } from '@/lib/types';
import { matchCategory } from '@money-tracker/shared';
import { parseISO } from 'date-fns';

/**
 * Converts a parsed bank row into a `Transaction` so the review screen can reuse the transaction row.
 *
 * The category is the one the import route will store: the winning rule's category, otherwise the
 * `income` / `other` placeholder. The rules list is oldest first, so its order settles ties like `createdAt` does.
 *
 * @param row - A row parsed from the bank CSV.
 * @param rules - The user's category rules, oldest first.
 * @returns A transaction with the row's import hash as its id and the amount in euros.
 * @example
 * importRowToTransaction({ date: '2026-10-16', description: 'AH', amountCents: -4320, importHash: 'h', ... }, rules);
 * // { id: 'h', date: Date(2026-10-16), merchant: 'AH', amount: -43.2, categoryKey: 'food', notes: null }
 */
export function importRowToTransaction(row: ImportRow, rules: CategoryRule[] = []): Transaction {
  const matchable = rules.map((rule, index) => ({
    pattern: rule.pattern,
    operator: rule.operator,
    category: rule.categoryKey,
    createdAt: new Date(index),
  }));
  const fallback = row.amountCents > 0 ? 'income' : 'other';

  return {
    id: row.importHash,
    date: parseISO(row.date),
    merchant: row.description,
    amount: row.amountCents / 100,
    categoryKey: matchCategory(row.description, matchable) ?? fallback,
    notes: row.notes,
  };
}
