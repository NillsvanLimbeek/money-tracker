import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { categoryRules, transactions } from '../db/schema';
import { db, jsonInit, requestAs, resetDb, seedTransaction, seedUser } from '../test/d1';
import { createRule } from '../utils/category-rule-row/category-rule-row.fixture';
import transactionRoutes from './transactions';

const asAlice = (path: string, init?: RequestInit) => requestAs(transactionRoutes, 'alice', path, init);

function importRow(n: number, overrides: Record<string, unknown> = {}) {
  return { date: '2026-02-01', description: `Shop ${n}`, amountCents: -500, importHash: `import-${n}`, ...overrides };
}

describe('transaction routes', () => {
  beforeEach(async () => {
    await resetDb();
    await seedUser('alice');
    await seedUser('bob');
  });

  describe('get /', () => {
    it('lists only the user\'s transactions, newest first then by id', async () => {
      await seedTransaction({ id: 'b', userId: 'alice', date: '2026-01-10' });
      await seedTransaction({ id: 'a', userId: 'alice', date: '2026-01-10' });
      await seedTransaction({ id: 'c', userId: 'alice', date: '2026-01-20' });
      await seedTransaction({ id: 'theirs', userId: 'bob', date: '2026-01-30' });

      const res = await asAlice('/');

      const rows = await res.json() as { id: string }[];
      expect(rows.map(row => row.id)).toEqual(['c', 'a', 'b']);
    });

    it('filters by month, including the year boundary', async () => {
      await seedTransaction({ id: 'dec-first', userId: 'alice', date: '2026-12-01' });
      await seedTransaction({ id: 'dec-last', userId: 'alice', date: '2026-12-31' });
      await seedTransaction({ id: 'jan', userId: 'alice', date: '2027-01-01' });
      await seedTransaction({ id: 'nov', userId: 'alice', date: '2026-11-30' });

      const res = await asAlice('/?month=2026-12');

      const rows = await res.json() as { id: string }[];
      expect(rows.map(row => row.id).sort()).toEqual(['dec-first', 'dec-last']);
    });

    it('rejects a malformed month', async () => {
      expect((await asAlice('/?month=2026-13')).status).toBe(400);
    });
  });

  describe('get /months', () => {
    it('lists the distinct months with transactions for the user, oldest first', async () => {
      await seedTransaction({ id: 'a', userId: 'alice', date: '2026-10-31' });
      await seedTransaction({ id: 'b', userId: 'alice', date: '2026-10-01' });
      await seedTransaction({ id: 'c', userId: 'alice', date: '2026-02-15' });
      await seedTransaction({ id: 'theirs', userId: 'bob', date: '2026-05-01' });

      const res = await asAlice('/months');

      expect(await res.json()).toEqual(['2026-02', '2026-10']);
    });

    it('returns an empty list when there are no transactions', async () => {
      expect(await (await asAlice('/months')).json()).toEqual([]);
    });
  });

  describe('get /hashes', () => {
    it('returns the user\'s import hashes within the inclusive date range', async () => {
      await seedTransaction({ id: 'before', userId: 'alice', date: '2026-01-09' });
      await seedTransaction({ id: 'start', userId: 'alice', date: '2026-01-10' });
      await seedTransaction({ id: 'end', userId: 'alice', date: '2026-01-20' });
      await seedTransaction({ id: 'after', userId: 'alice', date: '2026-01-21' });
      await seedTransaction({ id: 'theirs', userId: 'bob', date: '2026-01-15' });

      const res = await asAlice('/hashes?from=2026-01-10&to=2026-01-20');

      expect((await res.json() as string[]).sort()).toEqual(['hash-end', 'hash-start']);
    });

    it('rejects a missing or invalid range', async () => {
      expect((await asAlice('/hashes?from=2026-01-10')).status).toBe(400);
      expect((await asAlice('/hashes?from=nope&to=2026-01-20')).status).toBe(400);
    });
  });

  describe('post /import', () => {
    it('categorises rows with the user\'s rules and falls back for the rest', async () => {
      await db.insert(categoryRules).values(createRule({ userId: 'alice', pattern: 'albert', category: 'food' }));
      await db.insert(categoryRules).values(createRule({ id: 'bobs', userId: 'bob', pattern: 'netflix', category: 'fun' }));

      const res = await asAlice('/import', jsonInit('POST', [
        importRow(1, { description: 'Albert Heijn' }),
        importRow(2, { description: 'Netflix', amountCents: -1299 }),
        importRow(3, { description: 'Salary', amountCents: 250000 }),
      ]));

      expect(await res.json()).toEqual({ imported: 3, skipped: 0, uncategorised: 1 });
      const rows = await db.select().from(transactions).orderBy(transactions.importHash);
      expect(rows.map(row => [row.category, row.categorySource])).toEqual([
        ['food', 'rule'],
        ['other', 'default'],
        ['income', 'default'],
      ]);
      expect(rows.every(row => row.userId === 'alice')).toBe(true);
    });

    it('skips rows that were already imported', async () => {
      await asAlice('/import', jsonInit('POST', [importRow(1), importRow(2)]));

      const res = await asAlice('/import', jsonInit('POST', [importRow(2), importRow(3)]));

      expect(await res.json()).toEqual({ imported: 1, skipped: 1, uncategorised: 1 });
      expect(await db.select().from(transactions)).toHaveLength(3);
    });

    it('treats the same import hash as new for another user', async () => {
      await requestAs(transactionRoutes, 'bob', '/import', jsonInit('POST', [importRow(1)]));

      const res = await asAlice('/import', jsonInit('POST', [importRow(1)]));

      expect(await res.json()).toEqual({ imported: 1, skipped: 0, uncategorised: 1 });
    });

    it('imports more rows than fit in one statement', async () => {
      const rows = Array.from({ length: 50 }, (_, i) => importRow(i));

      const res = await asAlice('/import', jsonInit('POST', rows));

      expect(await res.json()).toEqual({ imported: 50, skipped: 0, uncategorised: 50 });
      expect(await db.select().from(transactions)).toHaveLength(50);
    });

    it('rejects an empty or invalid body', async () => {
      expect((await asAlice('/import', jsonInit('POST', []))).status).toBe(400);
      expect((await asAlice('/import', jsonInit('POST', [importRow(1, { date: 'yesterday' })]))).status).toBe(400);
    });
  });

  describe('patch /:id', () => {
    it('sets the category and marks it as manual', async () => {
      await seedTransaction({ id: 't1', userId: 'alice', category: 'other' });

      const res = await asAlice('/t1', jsonInit('PATCH', { category: 'gifts' }));

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ id: 't1', category: 'gifts', categorySource: 'manual' });
    });

    it('responds with 404 and changes nothing for another user\'s transaction', async () => {
      await seedTransaction({ id: 'theirs', userId: 'bob', category: 'other' });

      const res = await asAlice('/theirs', jsonInit('PATCH', { category: 'hacked' }));

      expect(res.status).toBe(404);
      const [row] = await db.select().from(transactions).where(eq(transactions.id, 'theirs'));
      expect(row).toMatchObject({ category: 'other', categorySource: 'default' });
    });

    it('rejects an empty category', async () => {
      await seedTransaction({ id: 't1', userId: 'alice' });

      expect((await asAlice('/t1', jsonInit('PATCH', { category: '  ' }))).status).toBe(400);
    });
  });
});
