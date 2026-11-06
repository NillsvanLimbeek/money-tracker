import type { Transaction } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { filterTransactions } from './filter-transactions';

function transaction(id: string, merchant: string, categoryKey: string, notes?: string): Transaction {
  return { id, date: new Date('2026-10-01'), merchant, amount: -10, categoryKey, notes };
}

const transactions = [
  transaction('1', 'Albert Heijn Amsterdam', 'food'),
  transaction('2', 'NS Reizigers', 'transport', 'Name: OV-chipkaart Reference: 12345'),
  transaction('3', 'Jumbo Utrecht', 'food'),
];

describe('filterTransactions', () => {
  it('returns everything without filters', () => {
    expect(filterTransactions(transactions, { search: '', categories: [] })).toEqual(transactions);
  });

  it('treats a blank search as no search', () => {
    expect(filterTransactions(transactions, { search: '   ', categories: [] })).toEqual(transactions);
  });

  it('filters by category', () => {
    const ids = filterTransactions(transactions, { search: '', categories: ['food'] }).map(t => t.id);

    expect(ids).toEqual(['1', '3']);
  });

  it('matches the description case-insensitively', () => {
    const ids = filterTransactions(transactions, { search: 'jumbo', categories: [] }).map(t => t.id);

    expect(ids).toEqual(['3']);
  });

  it('tolerates a typo', () => {
    const ids = filterTransactions(transactions, { search: 'albrt heijn', categories: [] }).map(t => t.id);

    expect(ids).toEqual(['1']);
  });

  it('matches the bank notes', () => {
    const ids = filterTransactions(transactions, { search: 'chipkaart', categories: [] }).map(t => t.id);

    expect(ids).toEqual(['2']);
  });

  it('combines search and category', () => {
    expect(filterTransactions(transactions, { search: 'reizigers', categories: ['food'] })).toEqual([]);
  });
});
