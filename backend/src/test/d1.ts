import type { AppEnv, Bindings } from '../bindings';
import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { createDb } from '../db';
import { categoryRules, transactions, user } from '../db/schema';

export const db = createDb(env.DB);

type TransactionRow = typeof transactions.$inferInsert;

/** Empties every table the specs write to. */
export async function resetDb() {
  await db.delete(transactions);
  await db.delete(categoryRules);
  await db.delete(user);
}

export async function seedUser(id: string) {
  await db.insert(user).values({ id, name: id, email: `${id}@example.com`, createdAt: new Date(), updatedAt: new Date() });
}

export async function seedTransaction(overrides: Partial<TransactionRow> & Pick<TransactionRow, 'id' | 'userId'>) {
  const row: TransactionRow = {
    date: '2026-01-15',
    description: 'Albert Heijn 1234',
    amountCents: -1000,
    category: 'other',
    categorySource: 'default',
    importHash: `hash-${overrides.id}`,
    createdAt: new Date(2026, 0, 1),
    ...overrides,
  };

  await db.insert(transactions).values(row);

  return row;
}

/** Sends a request to `routes` as if `userId` had passed `requireAuth`. */
export function requestAs(routes: Hono<AppEnv>, userId: string, path: string, init?: RequestInit) {
  const app = new Hono<AppEnv>();

  app.use('*', async (c, next) => {
    c.set('userId', userId);
    await next();
  });
  app.route('/', routes);

  return app.request(path, init, env as unknown as Bindings);
}

export function jsonInit(method: string, body: unknown): RequestInit {
  return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}
