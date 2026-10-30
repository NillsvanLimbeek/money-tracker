export type RuleOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';

export interface CategoryRule {
  id: string;
  pattern: string;
  operator: RuleOperator;
  categoryKey: string;
  // How many existing transactions the rule currently categorises.
  matches: number;
}
