import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { createDb } from '../../db';
import { categoryRules, user } from '../../db/schema';
import { createRule } from '../category-rule-row/category-rule-row.fixture';
import { loadRules } from './load-rules';

const db = createDb(env.DB);

async function seedUser(id: string) {
  await db.insert(user).values({ id, name: id, email: `${id}@example.com`, createdAt: new Date(), updatedAt: new Date() });
}

describe('loadRules', () => {
  beforeEach(async () => {
    await db.delete(user);
    await seedUser('user-1');
    await seedUser('user-2');
  });

  it('returns only the given user\'s rules', async () => {
    await db.insert(categoryRules).values([
      createRule({ id: 'mine', userId: 'user-1' }),
      createRule({ id: 'theirs', userId: 'user-2' }),
    ]);

    const rules = await loadRules(db, 'user-1');

    expect(rules.map(rule => rule.id)).toEqual(['mine']);
  });

  it('orders by creation date, then id', async () => {
    await db.insert(categoryRules).values([
      createRule({ id: 'b', createdAt: new Date(2026, 0, 2) }),
      createRule({ id: 'c', createdAt: new Date(2026, 0, 1) }),
      createRule({ id: 'a', createdAt: new Date(2026, 0, 2) }),
    ]);

    const rules = await loadRules(db, 'user-1');

    expect(rules.map(rule => rule.id)).toEqual(['c', 'a', 'b']);
  });
});
