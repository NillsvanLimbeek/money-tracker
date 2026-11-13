import type { Transaction } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { groupSpendingByCategory } from './group-spending-by-category';

function transaction(categoryKey: string, amount: number): Transaction {
  return { id: `${categoryKey}-${amount}`, date: new Date(2026, 10, 1), merchant: 'Shop', amount, categoryKey };
}

describe('groupSpendingByCategory', () => {
  it('returns nothing when there is no spending', () => {
    expect(groupSpendingByCategory([], [])).toEqual([]);
    expect(groupSpendingByCategory([transaction('income', 1000)], [])).toEqual([]);
  });

  it('sums spending per category, biggest first, and ignores income', () => {
    const result = groupSpendingByCategory([
      transaction('food', -20),
      transaction('housing', -60),
      transaction('food', -20),
      transaction('income', 500),
    ], []);

    expect(result.map(({ categoryKey, amount }) => [categoryKey, amount])).toEqual([['housing', 60], ['food', 40]]);
  });

  it('gives each category its share of all spending', () => {
    const result = groupSpendingByCategory([transaction('housing', -75), transaction('food', -25)], []);

    expect(result.map(({ share }) => share)).toEqual([75, 25]);
  });

  it('measures the change against the previous month', () => {
    const result = groupSpendingByCategory(
      [transaction('food', -150), transaction('housing', -100)],
      [transaction('food', -100), transaction('housing', -100)],
    );

    expect(result.find(({ categoryKey }) => categoryKey === 'food')!.change).toBe(50);
    expect(result.find(({ categoryKey }) => categoryKey === 'housing')!.change).toBe(0);
  });

  it('reports no change for a category that was not spent on before', () => {
    const [entry] = groupSpendingByCategory([transaction('food', -10)], []);

    expect(entry!.change).toBe(0);
  });
});
