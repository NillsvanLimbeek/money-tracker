import type { AppEnv } from '../bindings';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuth } from '../auth';
import { requireAuth } from './require-auth';

vi.mock('../auth', () => ({ getAuth: vi.fn() }));

const getSession = vi.fn();

function createApp() {
  const app = new Hono<AppEnv>();
  app.get('/protected', requireAuth, c => c.json({ userId: c.get('userId') }));
  return app;
}

describe('requireAuth', () => {
  beforeEach(() => {
    getSession.mockReset();
    vi.mocked(getAuth).mockReturnValue({ api: { getSession } } as unknown as ReturnType<typeof getAuth>);
  });

  it('responds with 401 and skips the handler when there is no session', async () => {
    getSession.mockResolvedValue(null);

    const res = await createApp().request('/protected');

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('sets userId on the context and runs the handler when a session exists', async () => {
    getSession.mockResolvedValue({ user: { id: 'user-1' } });

    const res = await createApp().request('/protected');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: 'user-1' });
  });

  it('resolves the session from the incoming request headers', async () => {
    getSession.mockResolvedValue({ user: { id: 'user-1' } });

    await createApp().request('/protected', { headers: { cookie: 'session=abc' } });

    const { headers } = getSession.mock.calls[0]![0] as { headers: Headers };
    expect(headers.get('cookie')).toBe('session=abc');
  });
});
