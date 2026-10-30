export type RuleOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';

export interface CategoryRule {
  id: string;
  pattern: string;
  operator: RuleOperator;
  categoryKey: string;
  // How many existing transactions the rule currently categorises.
  matches: number;
}

export interface NewCategoryRule {
  pattern: string;
  operator: RuleOperator;
  category: string;
}

export interface RuleMatchGroup {
  description: string;
  // How many transactions share this description.
  count: number;
  // Date (ISO) and amount of the newest of those transactions.
  date: string;
  amountCents: number;
}

export interface RulePreview {
  // Transactions the rule would match.
  count: number;
  descriptions: RuleMatchGroup[];
}
