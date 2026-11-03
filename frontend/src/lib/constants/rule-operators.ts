import type { RuleOperator } from '../types';
import { m } from '@/paraglide/messages';

// `strength` is how specific the operator is when overlapping rules are resolved.
export const RULE_OPERATORS: Record<RuleOperator, { label: string; strength: 1 | 2 | 3 }> = {
  equals: { label: m.operator_equals(), strength: 3 },
  startsWith: { label: m.operator_starts_with(), strength: 2 },
  endsWith: { label: m.operator_ends_with(), strength: 2 },
  contains: { label: m.operator_contains(), strength: 1 },
};
