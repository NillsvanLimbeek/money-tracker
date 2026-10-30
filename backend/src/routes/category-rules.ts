import type { AppEnv } from '../bindings';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { MAX_UPDATE_IDS } from '../constants';
import { createDb } from '../db';
import { categoryRules, transactions } from '../db/schema';
import { validate } from '../middleware/validate';
import { createRuleBodySchema, updateRuleBodySchema } from '../schemas';
import { findChangedIds, isDuplicate, loadDescriptions, loadRules, toApiRule } from '../utils';

const categoryRuleRoutes = new Hono<AppEnv>();

categoryRuleRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const [rules, descriptions] = await Promise.all([loadRules(db, userId), loadDescriptions(db, userId)]);

  return c.json(rules.map(rule => toApiRule(rule, descriptions)));
});

categoryRuleRoutes.post('/', validate('json', createRuleBodySchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = createDb(c.env.DB);

  if (isDuplicate(await loadRules(db, userId), body.pattern, body.operator))
    return c.json({ error: 'A rule with this pattern and operator already exists' }, 409);

  const [created] = await db
    .insert(categoryRules)
    .values({ ...body, id: crypto.randomUUID(), userId, createdAt: new Date() })
    .returning();

  return c.json(toApiRule(created!, await loadDescriptions(db, userId)), 201);
});

categoryRuleRoutes.patch('/:id', validate('json', updateRuleBodySchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = createDb(c.env.DB);

  const rules = await loadRules(db, userId);
  const existing = rules.find(rule => rule.id === c.req.param('id'));

  if (!existing)
    return c.json({ error: 'Rule not found' }, 404);

  if (isDuplicate(rules, body.pattern ?? existing.pattern, body.operator ?? existing.operator, existing.id))
    return c.json({ error: 'A rule with this pattern and operator already exists' }, 409);

  const [updated] = await db
    .update(categoryRules)
    .set(body)
    .where(and(eq(categoryRules.id, existing.id), eq(categoryRules.userId, userId)))
    .returning();

  return c.json(toApiRule(updated!, await loadDescriptions(db, userId)));
});

// Transactions it categorised keep their category.
categoryRuleRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const deleted = await db
    .delete(categoryRules)
    .where(and(eq(categoryRules.id, c.req.param('id')), eq(categoryRules.userId, userId)))
    .returning({ id: categoryRules.id });

  if (deleted.length === 0)
    return c.json({ error: 'Rule not found' }, 404);

  return c.body(null, 204);
});

categoryRuleRoutes.get('/:id/preview', async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const rules = await loadRules(db, userId);
  const rule = rules.find(item => item.id === c.req.param('id'));

  if (!rule)
    return c.json({ error: 'Rule not found' }, 404);

  return c.json({ count: (await findChangedIds(db, userId, rule, rules)).length });
});

categoryRuleRoutes.post('/:id/apply', async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);

  const rules = await loadRules(db, userId);
  const rule = rules.find(item => item.id === c.req.param('id'));

  if (!rule)
    return c.json({ error: 'Rule not found' }, 404);

  const ids = await findChangedIds(db, userId, rule, rules);
  const statements = [];

  for (let i = 0; i < ids.length; i += MAX_UPDATE_IDS) {
    statements.push(
      db
        .update(transactions)
        .set({ category: rule.category, categorySource: 'rule' })
        .where(and(eq(transactions.userId, userId), inArray(transactions.id, ids.slice(i, i + MAX_UPDATE_IDS)))),
    );
  }

  if (statements.length > 0)
    await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return c.json({ updated: ids.length });
});

export default categoryRuleRoutes;
