import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

type Target = Parameters<typeof zValidator>[0];

/**
 * Request validator wrapping `zValidator` with a uniform error response.
 *
 * On failure it responds with 400 and `{ error: 'Validation failed', issues }`,
 * where `issues` is the flattened Zod error. On success the parsed data is
 * available through `c.req.valid(target)`.
 *
 * @param target - Part of the request to validate (e.g. `'json'`, `'query'`, `'param'`).
 * @param schema - Zod schema the target must satisfy.
 * @returns A Hono middleware that validates the given request target.
 */
export function validate<T extends Target, S extends z.ZodType>(target: T, schema: S) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Validation failed', issues: z.flattenError(result.error) }, 400);
    }
  });
}
