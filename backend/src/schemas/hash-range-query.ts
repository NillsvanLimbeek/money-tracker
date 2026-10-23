import { z } from 'zod';

export const hashRangeQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});
