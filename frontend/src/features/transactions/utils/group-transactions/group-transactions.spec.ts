import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { afterEach, describe, expect, it } from 'vitest';
import { overwriteGetLocale } from '@/paraglide/runtime';
import { groupTransactionsByDay } from './group-transactions';

function transaction(id: string, date: Date, amount: number): Transaction {
  return { id, date, merchant: 'Shop', amount, categoryKey: 'food' };
}

describe('groupTransactionsByDay', () => {
  afterEach(() => {
    overwriteGetLocale(() => 'en');
  });

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

  it('labels days in Dutch when the locale is nl', () => {
    overwriteGetLocale(() => 'nl');
    const [group] = groupTransactionsByDay([transaction('a', new Date(2026, 0, 5), -10)]);

    expect(group!.label).toBe('maa 5 jan');
  });

  it('labels days as EEE d MMM', () => {
    const [group] = groupTransactionsByDay([transaction('a', new Date(2020, 0, 5), -1)]);

    expect(group!.label).toBe('Sun 5 Jan');
  });

  it('prefixes today', () => {
    const today = new Date();

    const [group] = groupTransactionsByDay([transaction('a', today, -1)]);

    expect(group!.label).toBe(`Today · ${format(today, 'EEE d MMM')}`);
  });
});
