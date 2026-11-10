import type { RuleOperator } from '@/lib/types';
import { m } from '@/paraglide/messages';

export const RULE_OPERATORS: Record<RuleOperator, { label: string }> = {
  equals: { label: m.operator_equals() },
  startsWith: { label: m.operator_starts_with() },
  endsWith: { label: m.operator_ends_with() },
  contains: { label: m.operator_contains() },
};
