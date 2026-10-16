import { z } from 'zod';
import { MAX_IMPORT_ROWS } from '../constants';
import { nonEmptyString } from './non-empty-string';

export const importRowSchema = z.object({
  date: z.iso.date(),
  description: nonEmptyString,
  amountCents: z.int(),
  rawCounterparty: z.string().nullish().transform(value => value ?? null),
  mutationType: z.string().nullish().transform(value => value ?? null),
  importHash: nonEmptyString,
});

export const importBodySchema = z.array(importRowSchema).min(1).max(MAX_IMPORT_ROWS);

export const updateCategoryBodySchema = z.object({
  category: nonEmptyString,
});

export type ImportRow = z.infer<typeof importRowSchema>;
