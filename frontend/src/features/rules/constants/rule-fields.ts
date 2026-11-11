import type { RuleFieldConfig } from '@/features/rules/types';
import type { RuleOperator } from '@/lib/types';
import { RULE_OPERATORS } from '@/lib/constants';
import { m } from '@/paraglide/messages';

export const RULE_FIELDS: RuleFieldConfig[] = [
  {
    name: 'operator',
    type: 'select',
    label: m.rule_field_operator(),
    items: (Object.keys(RULE_OPERATORS) as RuleOperator[]).map(value => ({ value, label: RULE_OPERATORS[value].label })),
  },
  { name: 'pattern', type: 'text', placeholder: m.rule_field_pattern_placeholder() },
  { name: 'categoryKey', type: 'categories', label: m.rule_field_category() },
];
