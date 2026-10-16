import { z } from 'zod';

export const monthQuerySchema = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'must be formatted as YYYY-MM');

export const listQuerySchema = z.object({
  month: monthQuerySchema.optional(),
});
