import type { Transaction } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';

export interface TransactionGroup {
  key: string;
  label: string;
  total: number;
  transactions: Transaction[];
}

function dayLabel(date: Date) {
  if (isToday(date))
    return 'Today';
  if (isYesterday(date))
    return 'Yesterday';
  return format(date, 'dd MMM');
}

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
