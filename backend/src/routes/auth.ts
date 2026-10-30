import type { Bindings } from '../bindings';
import { Hono } from 'hono';
import { getAuth } from '../auth';

const authRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Registers a new account with email and password.
 *
 * Forwards the JSON body to Better Auth and returns its response as-is,
 * including any session cookie it sets.
 */
authRoutes.post('/sign-up', async (c) => {
  const body = await c.req.json();

  return getAuth(c).api.signUpEmail({
    body,
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

/**
 * Signs in with email and password.
 *
 * Forwards the JSON body to Better Auth and returns its response as-is,
 * including any session cookie it sets.
 */
authRoutes.post('/sign-in', async (c) => {
  const body = await c.req.json();

  return getAuth(c).api.signInEmail({
    body,
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

/**
 * Ends the current session.
 *
 * Passes the request headers to Better Auth, which clears the session cookie.
 */
authRoutes.post('/sign-out', async (c) => {
  return getAuth(c).api.signOut({
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

/**
 * Returns the current session, resolved from the request headers.
 */
authRoutes.get('/session', async (c) => {
  return getAuth(c).api.getSession({
    headers: c.req.raw.headers,
    asResponse: true,
  });
});

export default authRoutes;
