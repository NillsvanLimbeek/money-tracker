import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validate } from './validate';

const schema = z.object({ name: z.string().min(1), amount: z.number() });

function createApp() {
  const app = new Hono();
  app.post('/items', validate('json', schema), c => c.json(c.req.valid('json')));
  app.get('/items', validate('query', z.object({ page: z.string() })), c => c.json(c.req.valid('query')));
  return app;
}

function post(body: unknown) {
  return createApp().request('/items', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('validate', () => {
  it('passes the parsed data to the handler when valid', async () => {
    const res = await post({ name: 'Coffee', amount: 3 });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: 'Coffee', amount: 3 });
  });

  it('responds with 400 and flattened issues when invalid', async () => {
    const res = await post({ name: '', amount: 'x' });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Validation failed',
      issues: {
        formErrors: [],
        fieldErrors: {
          name: [expect.any(String)],
          amount: [expect.any(String)],
        },
      },
    });
  });

  it('validates the requested target', async () => {
    const app = createApp();

    expect((await app.request('/items?page=2')).status).toBe(200);

    const res = await app.request('/items');
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'Validation failed' });
  });
});
