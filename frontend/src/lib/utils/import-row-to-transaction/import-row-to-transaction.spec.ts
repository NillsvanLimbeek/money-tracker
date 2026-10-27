import type { ImportRow } from '@/lib/types';
import { describe, expect, it } from 'vitest';
import { importRowToTransaction } from './import-row-to-transaction';

const ROW: ImportRow = {
  date: '2026-10-16',
  description: 'Albert Heijn',
  amountCents: -4320,
  rawCounterparty: null,
  mutationType: null,
  notes: 'Name: Albert Heijn',
  importHash: 'hash',
};

describe('importRowToTransaction', () => {
  it('maps the row fields onto a transaction', () => {
    expect(importRowToTransaction(ROW)).toEqual({
      id: 'hash',
      date: new Date(2026, 9, 16),
      merchant: 'Albert Heijn',
      amount: -43.2,
      categoryKey: 'other',
      notes: 'Name: Albert Heijn',
    });
  });

  it('categorises credits as income', () => {
    expect(importRowToTransaction({ ...ROW, amountCents: 1000 }).categoryKey).toBe('income');
  });
});
