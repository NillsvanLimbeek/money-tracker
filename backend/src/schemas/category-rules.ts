import { z } from 'zod';
import { nonEmptyString } from './non-empty-string';
import { ruleOperatorSchema } from './rule-operator-schema';

export const createRuleBodySchema = z.object({
  pattern: nonEmptyString,
  operator: ruleOperatorSchema,
  category: nonEmptyString,
});

export const updateRuleBodySchema = createRuleBodySchema.partial().refine(
  body => Object.keys(body).length > 0,
  'at least one field is required',
);

export const previewRuleQuerySchema = z.object({
  pattern: nonEmptyString,
  operator: ruleOperatorSchema,
});
