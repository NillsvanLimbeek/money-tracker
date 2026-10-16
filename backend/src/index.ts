import type { AppEnv } from './bindings';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth } from './middleware/require-auth';
import authRoutes from './routes/auth';

const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  return cors({ origin: c.env.CORS_ORIGIN, credentials: true })(c, next);
});

app.get('/health', c => c.json({ status: 'ok' }));

app.route('/api', authRoutes);

app.use('/api/transactions/*', requireAuth);

export default app;
