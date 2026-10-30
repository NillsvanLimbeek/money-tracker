import type { Bindings } from '../bindings';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuth } from '../auth';
import authRoutes from './auth';

vi.mock('../auth', () => ({ getAuth: vi.fn() }));

const api = {
  signUpEmail: vi.fn(),
  signInEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
};

function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();
  app.route('/auth', authRoutes);
  return app;
}

function postJson(path: string, body: unknown, headers: Record<string, string> = {}) {
  return createApp().request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('authRoutes', () => {
  beforeEach(() => {
    for (const fn of Object.values(api))
      fn.mockReset().mockResolvedValue(new Response('ok', { status: 200 }));

    vi.mocked(getAuth).mockReturnValue({ api } as unknown as ReturnType<typeof getAuth>);
  });

  describe.each([
    ['/auth/sign-up', api.signUpEmail],
    ['/auth/sign-in', api.signInEmail],
  ])('post %s', (path, handler) => {
    it('forwards the body and headers and asks for a Response', async () => {
      const body = { email: 'a@b.nl', password: 'secret' };

      await postJson(path, body, { cookie: 'session=abc' });

      const args = handler.mock.calls[0]![0] as { body: unknown; headers: Headers; asResponse: boolean };
      expect(args.body).toEqual(body);
      expect(args.headers.get('cookie')).toBe('session=abc');
      expect(args.asResponse).toBe(true);
    });

    it('returns the auth response untouched', async () => {
      handler.mockResolvedValue(new Response('{"error":"nope"}', { status: 422, headers: { 'set-cookie': 'a=b' } }));

      const res = await postJson(path, {});

      expect(res.status).toBe(422);
      expect(res.headers.get('set-cookie')).toBe('a=b');
      expect(await res.text()).toBe('{"error":"nope"}');
    });
  });

  describe('post /auth/sign-out', () => {
    it('forwards the headers and returns the auth response', async () => {
      api.signOut.mockResolvedValue(new Response(null, { status: 204 }));

      const res = await createApp().request('/auth/sign-out', { method: 'POST', headers: { cookie: 'session=abc' } });

      const args = api.signOut.mock.calls[0]![0] as { headers: Headers; asResponse: boolean };
      expect(args.headers.get('cookie')).toBe('session=abc');
      expect(args.asResponse).toBe(true);
      expect(res.status).toBe(204);
    });
  });

  describe('get /auth/session', () => {
    it('forwards the headers and returns the auth response', async () => {
      api.getSession.mockResolvedValue(new Response('{"user":{"id":"u1"}}', { status: 200 }));

      const res = await createApp().request('/auth/session', { headers: { cookie: 'session=abc' } });

      const args = api.getSession.mock.calls[0]![0] as { headers: Headers; asResponse: boolean };
      expect(args.headers.get('cookie')).toBe('session=abc');
      expect(args.asResponse).toBe(true);
      expect(await res.json()).toEqual({ user: { id: 'u1' } });
    });
  });
});
