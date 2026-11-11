import type { Transaction } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useMonthTotals } from './use-month-totals';

function transaction(amount: number): Transaction {
  return { id: String(amount), date: new Date(2026, 9, 1), merchant: 'Shop', amount, categoryKey: 'other' };
}

describe('useMonthTotals', () => {
  it('sums income and expenses separately, with expenses as a positive number', () => {
    const { income, expense } = useMonthTotals([transaction(3000), transaction(400), transaction(-25.5), transaction(-74.5)]);

    expect(income.value).toBe(3400);
    expect(expense.value).toBe(100);
  });

  it('is zero without transactions', () => {
    const { income, expense } = useMonthTotals([]);

    expect(income.value).toBe(0);
    expect(expense.value).toBe(0);
  });

  it('follows a reactive list', () => {
    const transactions = ref([transaction(100)]);
    const { income } = useMonthTotals(transactions);

    transactions.value = [transaction(100), transaction(50)];

    expect(income.value).toBe(150);
  });
});
