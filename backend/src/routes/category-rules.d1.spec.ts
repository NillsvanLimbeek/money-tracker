import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { SUGGESTED_RULES } from '../constants';
import { categoryRules, transactions } from '../db/schema';
import { db, jsonInit, requestAs, resetDb, seedTransaction, seedUser } from '../test/d1';
import { createRule } from '../utils/category-rule-row/category-rule-row.fixture';
import categoryRuleRoutes from './category-rules';

const asAlice = (path: string, init?: RequestInit) => requestAs(categoryRuleRoutes, 'alice', path, init);

async function seedRule(overrides: Parameters<typeof createRule>[0] = {}) {
  await db.insert(categoryRules).values(createRule({ userId: 'alice', ...overrides }));
}

describe('category rule routes', () => {
  beforeEach(async () => {
    await resetDb();
    await seedUser('alice');
    await seedUser('bob');
  });

  describe('get /', () => {
    it('lists only the user\'s rules, with how many descriptions each matches', async () => {
      await seedRule({ id: 'mine', pattern: 'albert' });
      await seedRule({ id: 'theirs', userId: 'bob' });
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1' });
      await seedTransaction({ id: 't2', userId: 'alice', description: 'Netflix' });
      await seedTransaction({ id: 't3', userId: 'bob', description: 'Albert Heijn 2' });

      const res = await asAlice('/');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([
        { id: 'mine', pattern: 'albert', operator: 'contains', categoryKey: 'food', matches: 1 },
      ]);
    });
  });

  describe('get /preview', () => {
    it('counts and groups the user\'s matching transactions for an unsaved rule', async () => {
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', date: '2026-10-01', amountCents: -100 });
      await seedTransaction({ id: 't2', userId: 'alice', description: 'Albert Heijn 1', date: '2026-10-02', amountCents: -200 });
      await seedTransaction({ id: 't3', userId: 'alice', description: 'Netflix' });
      await seedTransaction({ id: 't4', userId: 'bob', description: 'Albert Heijn 2' });

      const res = await asAlice('/preview?pattern=albert&operator=contains');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        count: 2,
        descriptions: [{ description: 'Albert Heijn 1', count: 2, date: '2026-10-02', amountCents: -200 }],
      });
    });

    it('rejects a missing pattern or an unknown operator', async () => {
      expect((await asAlice('/preview?operator=contains')).status).toBe(400);
      expect((await asAlice('/preview?pattern=albert&operator=regex')).status).toBe(400);
    });
  });

  describe('post /', () => {
    const body = { pattern: 'albert', operator: 'contains', category: 'food' };

    it('creates a rule owned by the user', async () => {
      const res = await asAlice('/', jsonInit('POST', body));

      expect(res.status).toBe(201);
      expect(await res.json()).toMatchObject({ pattern: 'albert', operator: 'contains', categoryKey: 'food' });

      const rows = await db.select().from(categoryRules);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.userId).toBe('alice');
    });

    it('rejects a duplicate pattern and operator, ignoring case and spacing', async () => {
      await seedRule({ pattern: 'albert' });

      const res = await asAlice('/', jsonInit('POST', { ...body, pattern: '  ALBERT ' }));

      expect(res.status).toBe(409);
      expect(await db.select().from(categoryRules)).toHaveLength(1);
    });

    it('allows another user to have the same pattern and operator', async () => {
      await seedRule({ userId: 'bob', pattern: 'albert' });

      const res = await asAlice('/', jsonInit('POST', body));

      expect(res.status).toBe(201);
    });

    it('rejects an invalid body', async () => {
      const res = await asAlice('/', jsonInit('POST', { ...body, operator: 'regex' }));

      expect(res.status).toBe(400);
    });
  });

  describe('post /suggested', () => {
    it('creates the suggested rules for the user and recategorises matching transactions', async () => {
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'other' });
      await seedTransaction({ id: 't2', userId: 'alice', description: 'Unknown shop', category: 'other' });
      await seedTransaction({ id: 't3', userId: 'bob', description: 'Albert Heijn 2', category: 'other' });

      const res = await asAlice('/suggested', { method: 'POST' });
      const { created, updated } = await res.json() as { created: number; updated: number };

      expect(res.status).toBe(201);
      expect(created).toBe(SUGGESTED_RULES.length);
      expect(updated).toBe(1);
      expect(await db.select().from(categoryRules).where(eq(categoryRules.userId, 'alice'))).toHaveLength(SUGGESTED_RULES.length);
      expect(await db.select().from(categoryRules).where(eq(categoryRules.userId, 'bob'))).toHaveLength(0);

      const rows = await db.select().from(transactions).orderBy(transactions.id);
      expect(rows[0]).toMatchObject({ category: 'food', categorySource: 'rule' });
      expect(rows[1]).toMatchObject({ category: 'other', categorySource: 'default' });
      expect(rows[2]).toMatchObject({ category: 'other', categorySource: 'default' });
    });

    it('skips suggestions the user already has, ignoring case and spacing', async () => {
      await seedRule({ id: 'mine', pattern: '  ALBERT  Heijn ', category: 'shopping' });
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'shopping', categorySource: 'rule' });

      const res = await asAlice('/suggested', { method: 'POST' });

      expect(await res.json()).toEqual({ created: SUGGESTED_RULES.length - 1, updated: 0 });
      const [row] = await db.select().from(transactions);
      expect(row).toMatchObject({ category: 'shopping', categorySource: 'rule' });
    });

    it('adds nothing the second time', async () => {
      await asAlice('/suggested', { method: 'POST' });

      const res = await asAlice('/suggested', { method: 'POST' });

      expect(await res.json()).toEqual({ created: 0, updated: 0 });
      expect(await db.select().from(categoryRules)).toHaveLength(SUGGESTED_RULES.length);
    });

    it('never touches manually categorised transactions', async () => {
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'gifts', categorySource: 'manual' });

      const res = await asAlice('/suggested', { method: 'POST' });

      expect(await res.json()).toMatchObject({ updated: 0 });
      const [row] = await db.select().from(transactions);
      expect(row).toMatchObject({ category: 'gifts', categorySource: 'manual' });
    });

    it('leaves transactions an existing, more specific rule wins', async () => {
      await seedRule({ id: 'mine', pattern: 'albert heijn 1', operator: 'equals', category: 'shopping' });
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'shopping', categorySource: 'rule' });

      const res = await asAlice('/suggested', { method: 'POST' });

      expect(await res.json()).toMatchObject({ updated: 0 });
      const [row] = await db.select().from(transactions);
      expect(row!.category).toBe('shopping');
    });

    it('updates more transactions than fit in one statement', async () => {
      for (let i = 0; i < 200; i++)
        await seedTransaction({ id: `t${i}`, userId: 'alice', description: 'Albert Heijn', category: 'other' });

      const res = await asAlice('/suggested', { method: 'POST' });

      expect(await res.json()).toMatchObject({ updated: 200 });
      expect(await db.select().from(transactions).where(eq(transactions.category, 'food'))).toHaveLength(200);
    });
  });

  describe('patch /:id', () => {
    it('updates the given fields', async () => {
      await seedRule({ id: 'r1', pattern: 'albert' });

      const res = await asAlice('/r1', jsonInit('PATCH', { category: 'groceries' }));

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ id: 'r1', pattern: 'albert', categoryKey: 'groceries' });
    });

    it('does not treat the rule itself as a duplicate', async () => {
      await seedRule({ id: 'r1', pattern: 'albert' });

      const res = await asAlice('/r1', jsonInit('PATCH', { pattern: 'ALBERT' }));

      expect(res.status).toBe(200);
    });

    it('rejects a change that clashes with another rule', async () => {
      await seedRule({ id: 'r1', pattern: 'albert' });
      await seedRule({ id: 'r2', pattern: 'jumbo' });

      const res = await asAlice('/r2', jsonInit('PATCH', { pattern: 'albert' }));

      expect(res.status).toBe(409);
    });

    it('responds with 404 and changes nothing for another user\'s rule', async () => {
      await seedRule({ id: 'theirs', userId: 'bob', category: 'food' });

      const res = await asAlice('/theirs', jsonInit('PATCH', { category: 'hacked' }));

      expect(res.status).toBe(404);
      const [row] = await db.select().from(categoryRules).where(eq(categoryRules.id, 'theirs'));
      expect(row!.category).toBe('food');
    });

    it('rejects an empty body', async () => {
      await seedRule({ id: 'r1' });

      const res = await asAlice('/r1', jsonInit('PATCH', {}));

      expect(res.status).toBe(400);
    });
  });

  describe('delete /:id', () => {
    it('deletes the rule but leaves categorised transactions alone', async () => {
      await seedRule({ id: 'r1' });
      await seedTransaction({ id: 't1', userId: 'alice', category: 'food', categorySource: 'rule' });

      const res = await asAlice('/r1', { method: 'DELETE' });

      expect(res.status).toBe(204);
      expect(await db.select().from(categoryRules)).toHaveLength(0);
      const [row] = await db.select().from(transactions);
      expect(row).toMatchObject({ category: 'food', categorySource: 'rule' });
    });

    it('responds with 404 and keeps another user\'s rule', async () => {
      await seedRule({ id: 'theirs', userId: 'bob' });

      const res = await asAlice('/theirs', { method: 'DELETE' });

      expect(res.status).toBe(404);
      expect(await db.select().from(categoryRules)).toHaveLength(1);
    });
  });

  describe('get /:id/preview', () => {
    it('counts the transactions the rule would change without changing them', async () => {
      await seedRule({ id: 'r1', pattern: 'albert', category: 'food' });
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'other' });
      await seedTransaction({ id: 't2', userId: 'alice', description: 'Albert Heijn 2', category: 'food' });
      await seedTransaction({ id: 't3', userId: 'alice', description: 'Netflix', category: 'other' });

      const res = await asAlice('/r1/preview');

      expect(await res.json()).toEqual({ count: 1 });
      const rows = await db.select().from(transactions).where(eq(transactions.id, 't1'));
      expect(rows[0]!.category).toBe('other');
    });

    it('responds with 404 for another user\'s rule', async () => {
      await seedRule({ id: 'theirs', userId: 'bob' });

      expect((await asAlice('/theirs/preview')).status).toBe(404);
    });
  });

  describe('post /:id/apply', () => {
    it('recategorises matching transactions and marks them as rule-set', async () => {
      await seedRule({ id: 'r1', pattern: 'albert', category: 'food' });
      await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', category: 'other' });
      await seedTransaction({ id: 't2', userId: 'alice', description: 'Netflix', category: 'other' });

      const res = await asAlice('/r1/apply', { method: 'POST' });

      expect(await res.json()).toEqual({ updated: 1 });
      const rows = await db.select().from(transactions).orderBy(transactions.id);
      expect(rows[0]).toMatchObject({ category: 'food', categorySource: 'rule' });
      expect(rows[1]).toMatchObject({ category: 'other', categorySource: 'default' });
    });

    it('never touches manually categorised transactions', async () => {
      await seedRule({ id: 'r1', pattern: 'albert', category: 'food' });
      await seedTransaction({ id: 't1', userId: 'alice', category: 'gifts', categorySource: 'manual' });

      const res = await asAlice('/r1/apply', { method: 'POST' });

      expect(await res.json()).toEqual({ updated: 0 });
      const [row] = await db.select().from(transactions);
      expect(row).toMatchObject({ category: 'gifts', categorySource: 'manual' });
    });

    it('never touches another user\'s transactions', async () => {
      await seedRule({ id: 'r1', pattern: 'albert', category: 'food' });
      await seedTransaction({ id: 'theirs', userId: 'bob', category: 'other' });

      const res = await asAlice('/r1/apply', { method: 'POST' });

      expect(await res.json()).toEqual({ updated: 0 });
      const [row] = await db.select().from(transactions);
      expect(row!.category).toBe('other');
    });

    it('updates more transactions than fit in one statement', async () => {
      await seedRule({ id: 'r1', pattern: 'albert', category: 'food' });
      for (let i = 0; i < 200; i++)
        await seedTransaction({ id: `t${i}`, userId: 'alice', category: 'other' });

      const res = await asAlice('/r1/apply', { method: 'POST' });

      expect(await res.json()).toEqual({ updated: 200 });
      const rows = await db.select().from(transactions).where(eq(transactions.category, 'food'));
      expect(rows).toHaveLength(200);
    });

    it('responds with 404 for another user\'s rule', async () => {
      await seedRule({ id: 'theirs', userId: 'bob' });

      expect((await asAlice('/theirs/apply', { method: 'POST' })).status).toBe(404);
    });
  });
});
