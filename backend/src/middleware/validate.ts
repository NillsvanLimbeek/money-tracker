import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

type Target = Parameters<typeof zValidator>[0];

export function validate<T extends Target, S extends z.ZodType>(target: T, schema: S) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Validation failed', issues: z.flattenError(result.error) }, 400);
    }
  });
}
