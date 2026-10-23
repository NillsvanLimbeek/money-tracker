import type { Transaction } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { groupTransactionsByDay } from './group-transactions';

function transaction(id: string, date: Date, amount: number): Transaction {
  return { id, date, merchant: 'Shop', amount, categoryKey: 'food' };
}

describe('groupTransactionsByDay', () => {
  it('returns no groups for no transactions', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });

  it('groups by day, newest first, and sums the amounts', () => {
    const groups = groupTransactionsByDay([
      transaction('a', new Date(2020, 0, 5, 9), -10),
      transaction('b', new Date(2020, 0, 6, 12), -5),
      transaction('c', new Date(2020, 0, 5, 18), 2.5),
    ]);

    expect(groups.map(group => group.key)).toEqual(['2020-01-06', '2020-01-05']);
    expect(groups[1]!.total).toBe(-7.5);
    expect(groups[1]!.transactions.map(t => t.id)).toEqual(['c', 'a']);
  });

  it('labels older days as dd MMM', () => {
    const [group] = groupTransactionsByDay([transaction('a', new Date(2020, 0, 5), -1)]);

    expect(group!.label).toBe('05 Jan');
  });

  it('labels today and yesterday', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const groups = groupTransactionsByDay([transaction('a', yesterday, -1), transaction('b', today, -1)]);

    expect(groups.map(group => group.label)).toEqual(['Today', 'Yesterday']);
  });
});
