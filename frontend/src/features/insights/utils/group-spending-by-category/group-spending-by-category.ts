import type { Transaction } from '@/lib/types';
import { percentChange } from '../percent-change/percent-change';

export interface CategorySpend {
  categoryKey: string;
  /** What was spent in the category, as a positive amount in euros. */
  amount: number;
  /** The category's whole-number share of all spending. */
  share: number;
  /** The whole-number change in spending since the previous month. */
  change: number;
}

function sumByCategory(transactions: Transaction[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const { amount, categoryKey } of transactions) {
    if (amount < 0)
      totals.set(categoryKey, (totals.get(categoryKey) ?? 0) - amount);
  }

  return totals;
}

/**
 * Splits a month's spending over its categories, biggest first.
 *
 * @param transactions - The month's transactions. Income is ignored.
 * @param previousTransactions - The previous month's transactions, to measure the change against.
 * @returns One entry per category with spending.
 * @example
 * groupSpendingByCategory(current, previous)[0]; // { categoryKey: 'housing', amount: 950, share: 50, change: 0 }
 */
export function groupSpendingByCategory(transactions: Transaction[], previousTransactions: Transaction[]): CategorySpend[] {
  const totals = sumByCategory(transactions);
  const previousTotals = sumByCategory(previousTransactions);
  const spent = [...totals.values()].reduce((sum, amount) => sum + amount, 0);

  return [...totals]
    .map(([categoryKey, amount]) => ({
      categoryKey,
      amount,
      share: Math.round((amount / spent) * 100),
      change: percentChange(amount, previousTotals.get(categoryKey) ?? 0),
    }))
    .sort((a, b) => b.amount - a.amount);
}
