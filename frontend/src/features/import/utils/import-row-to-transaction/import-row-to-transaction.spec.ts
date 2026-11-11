import type { CategoryRule, ImportRow } from '@/lib/types';
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

  describe('with rules', () => {
    const rule = (id: string, pattern: string, categoryKey: string, operator: CategoryRule['operator'] = 'contains'): CategoryRule => ({ id, pattern, operator, categoryKey, matches: 0 });

    it('uses the category of the winning rule', () => {
      expect(importRowToTransaction(ROW, [rule('r1', 'heijn', 'food')]).categoryKey).toBe('food');
    });

    it('prefers the more specific rule', () => {
      const rules = [rule('r1', 'heijn', 'shopping'), rule('r2', 'albert heijn', 'food', 'equals')];

      expect(importRowToTransaction(ROW, rules).categoryKey).toBe('food');
    });

    it('breaks a tie in favour of the older rule', () => {
      const rules = [rule('r1', 'albert', 'food'), rule('r2', 'heijn', 'shopping')];

      expect(importRowToTransaction({ ...ROW, description: 'Albert' }, rules).categoryKey).toBe('food');
      expect(importRowToTransaction({ ...ROW, description: 'albert heijn' }, [rule('r1', 'heijn', 'food'), rule('r2', 'albert', 'shopping')]).categoryKey).toBe('shopping');
    });

    it('falls back to the placeholder when nothing matches', () => {
      expect(importRowToTransaction(ROW, [rule('r1', 'jumbo', 'food')]).categoryKey).toBe('other');
    });
  });
});
