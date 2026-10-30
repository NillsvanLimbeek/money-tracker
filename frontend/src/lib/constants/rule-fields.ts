import type { RuleFieldConfig, RuleOperator } from '@/lib/types';
import { RULE_OPERATORS } from './rule-operators';

export const RULE_FIELDS: RuleFieldConfig[] = [
  {
    name: 'operator',
    type: 'select',
    label: 'If the description',
    items: (Object.keys(RULE_OPERATORS) as RuleOperator[]).map(value => ({ value, label: RULE_OPERATORS[value].label })),
  },
  { name: 'pattern', type: 'text', placeholder: 'e.g. Albert Heijn' },
  { name: 'categoryKey', type: 'categories', label: 'Assign category' },
];
