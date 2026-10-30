import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../bindings';
import { getAuth } from '../auth';

/**
 * Guards a route behind a valid session.
 *
 * Resolves the session from the request headers; when none exists it responds
 * with 401 and stops the chain. Otherwise it stores the session user's id on
 * the context as `userId` and continues.
 */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await getAuth(c).api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.user.id);

  await next();
};
