import type { categoryRules } from '../db/schema';

export type CategoryRuleRow = typeof categoryRules.$inferSelect;
