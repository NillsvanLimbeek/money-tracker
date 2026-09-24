import type { Bindings } from './bindings';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  return cors({ origin: c.env.CORS_ORIGIN, credentials: true })(c, next);
});

app.get('/health', c => c.json({ status: 'ok' }));

export default app;
