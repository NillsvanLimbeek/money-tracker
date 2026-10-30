import type { Transaction } from '@/lib/types';
import { format, isToday } from 'date-fns';

export interface TransactionGroup {
  key: string;
  label: string;
  total: number;
  transactions: Transaction[];
}

function dayLabel(date: Date): string {
  const day = format(date, 'EEE d MMM');
  return isToday(date) ? `Today · ${day}` : day;
}

/**
 * Groups transactions by calendar day, newest day first, and totals each day.
 *
 * @param transactions - Transactions in any order.
 * @returns One group per day, keyed by `yyyy-MM-dd` and labelled `EEE d MMM`, prefixed with `Today ·` for today.
 * @example
 * groupTransactionsByDay([{ id: 'a', date: new Date(2026, 9, 3), merchant: 'AH', amount: -10, categoryKey: 'food' }]);
 * // [{ key: '2026-10-03', label: 'Sat 3 Oct', total: -10, transactions: [...] }]
 */
export function groupTransactionsByDay(transactions: Transaction[]): TransactionGroup[] {
  const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  const groups: TransactionGroup[] = [];

  for (const transaction of sorted) {
    const key = format(transaction.date, 'yyyy-MM-dd');
    let group = groups.find(g => g.key === key);

    if (!group) {
      group = { key, label: dayLabel(transaction.date), total: 0, transactions: [] };
      groups.push(group);
    }

    group.transactions.push(transaction);
    group.total += transaction.amount;
  }

  return groups;
}
