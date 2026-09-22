import type { Hyperdrive } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuth } from './auth';
import { createDb } from './db';

interface Bindings {
  HYPERDRIVE: Hyperdrive;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  return cors({ origin: c.env.CORS_ORIGIN, credentials: true })(c, next);
});

app.get('/health', c => c.json({ status: 'ok' }));

app.all('/api/auth/*', (c) => {
  const db = createDb(c.env.HYPERDRIVE);
  const auth = createAuth(db, {
    secret: c.env.BETTER_AUTH_SECRET,
    baseURL: new URL(c.req.url).origin,
    trustedOrigin: c.env.CORS_ORIGIN,
  });
  return auth.handler(c.req.raw);
});

export default app;
