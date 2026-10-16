import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../bindings';
import { getAuth } from '../auth';

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await getAuth(c).api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.user.id);

  await next();
};
