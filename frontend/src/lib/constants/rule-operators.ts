import type { RuleOperator } from '../types';

// `strength` is how specific the operator is when overlapping rules are resolved.
export const RULE_OPERATORS: Record<RuleOperator, { label: string; strength: 1 | 2 | 3 }> = {
  equals: { label: 'equals', strength: 3 },
  startsWith: { label: 'starts with', strength: 2 },
  endsWith: { label: 'ends with', strength: 2 },
  contains: { label: 'contains', strength: 1 },
};
