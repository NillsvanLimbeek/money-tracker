import type { Bindings } from '../bindings';
import { Hono } from 'hono';
import { getAuth } from '../auth';

const authRoutes = new Hono<{ Bindings: Bindings }>();

authRoutes.post('/sign-up', async (c) => {
  const body = await c.req.json();

  return getAuth(c).api.signUpEmail({
    body,
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

authRoutes.post('/sign-in', async (c) => {
  const body = await c.req.json();

  return getAuth(c).api.signInEmail({
    body,
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

authRoutes.post('/sign-out', async (c) => {
  return getAuth(c).api.signOut({
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

authRoutes.get('/session', async (c) => {
  return getAuth(c).api.getSession({
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

export default authRoutes;
