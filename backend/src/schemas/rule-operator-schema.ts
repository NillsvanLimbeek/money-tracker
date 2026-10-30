import { z } from 'zod';

export const ruleOperatorSchema = z.enum(['contains', 'equals', 'startsWith', 'endsWith']);
