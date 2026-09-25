import type { Transaction } from '../types';
import { subDays } from 'date-fns';

function daysAgo(days: number): Date {
  const now = new Date();
  return subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), days);
}

// Placeholder transactions until a real data source is wired up.
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: daysAgo(0), merchant: 'Albert Heijn', amount: -43.2, categoryKey: 'food' },
  { id: '2', date: daysAgo(0), merchant: 'Spotify', amount: -11.99, categoryKey: 'entertainment' },
  { id: '3', date: daysAgo(1), merchant: 'Werkgever BV', amount: 3400, categoryKey: 'income' },
  { id: '4', date: daysAgo(1), merchant: 'NS Reizen', amount: -18.4, categoryKey: 'transport' },
  { id: '5', date: daysAgo(2), merchant: 'Thuisbezorgd', amount: -31.5, categoryKey: 'food' },
  { id: '6', date: daysAgo(2), merchant: 'Huur augustus', amount: -950, categoryKey: 'housing' },
];
