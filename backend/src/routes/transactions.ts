import type { AppEnv } from '../bindings';
import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import { Hono } from 'hono';
import { IMPORT_CHUNK_SIZE } from '../constants';
import { createDb } from '../db';
import { transactions } from '../db/schema';
import { validate } from '../middleware/validate';
import { importBodySchema, listQuerySchema, updateCategoryBodySchema } from '../schemas';
import { nextMonth } from '../utils';

const transactionRoutes = new Hono<AppEnv>();

transactionRoutes.get('/', validate('query', listQuerySchema), async (c) => {
  const userId = c.get('userId');
  const { month } = c.req.valid('query');
  const db = createDb(c.env.DB);

  const rows = await db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      month ? gte(transactions.date, `${month}-01`) : undefined,
      month ? lt(transactions.date, `${nextMonth(month)}-01`) : undefined,
    ))
    .orderBy(desc(transactions.date), asc(transactions.id));

  return c.json(rows);
});

transactionRoutes.post('/import', validate('json', importBodySchema), async (c) => {
  const userId = c.get('userId');
  const rows = c.req.valid('json');
  const db = createDb(c.env.DB);
  const createdAt = new Date();

  const values = rows.map(row => ({
    ...row,
    id: crypto.randomUUID(),
    userId,
    // Placeholder until keyword categorisation lands.
    category: row.amountCents > 0 ? 'Income' : 'Other',
    createdAt,
  }));

  const statements = [];

  for (let i = 0; i < values.length; i += IMPORT_CHUNK_SIZE) {
    statements.push(
      db
        .insert(transactions)
        .values(values.slice(i, i + IMPORT_CHUNK_SIZE))
        .onConflictDoNothing({ target: [transactions.userId, transactions.importHash] })
        .returning({ id: transactions.id }),
    );
  }

  const results = await db.batch(statements as [typeof statements[number], ...typeof statements]);
  const imported = results.reduce((total, inserted) => total + inserted.length, 0);

  return c.json({ imported, skipped: rows.length - imported });
});

transactionRoutes.patch('/:id', validate('json', updateCategoryBodySchema), async (c) => {
  const userId = c.get('userId');
  const { category } = c.req.valid('json');
  const db = createDb(c.env.DB);

  const [updated] = await db
    .update(transactions)
    .set({ category })
    .where(and(
      eq(transactions.id, c.req.param('id')),
      eq(transactions.userId, userId),
    ))
    .returning();

  if (!updated) {
    return c.json({ error: 'Transaction not found' }, 404);
  }

  return c.json(updated);
});

export default transactionRoutes;
