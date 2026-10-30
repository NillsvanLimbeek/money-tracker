import type { RuleOperator } from './CategoryRule';

export interface RuleDraft {
  operator: RuleOperator;
  pattern: string;
  categoryKey: string | null;
}

export type RuleFieldConfig = {
  name: 'operator';
  type: 'select';
  label: string;
  items: { value: RuleOperator; label: string }[];
} | {
  name: 'pattern';
  type: 'text';
  placeholder: string;
} | {
  name: 'categoryKey';
  type: 'categories';
  label: string;
};
