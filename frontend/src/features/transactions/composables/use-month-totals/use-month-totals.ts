import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import type { Transaction } from '@/lib/types';
import { computed, toValue } from 'vue';

/**
 * The money coming in and going out across a list of transactions.
 *
 * @param transactions - The transactions to total, may be reactive.
 * @returns `income` as the sum of positive amounts and `expense` as the sum of negative amounts, made positive.
 * @example
 * const { income, expense } = useMonthTotals(transactions);
 */
export function useMonthTotals(transactions: MaybeRefOrGetter<Transaction[]>): { income: ComputedRef<number>; expense: ComputedRef<number> } {
  const income = computed(() => toValue(transactions)
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0));

  const expense = computed(() => toValue(transactions)
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0));

  return { income, expense };
}
