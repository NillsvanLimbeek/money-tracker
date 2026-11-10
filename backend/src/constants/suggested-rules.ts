import type { RuleOperator } from '@money-tracker/shared';

export interface SuggestedRule {
  pattern: string;
  operator: RuleOperator;
  category: string;
}

// Common Dutch merchants, matched against ING descriptions. Keep every pattern at 3+ characters so it can't match too much.
export const SUGGESTED_RULES: SuggestedRule[] = [
  { pattern: 'albert heijn', operator: 'contains', category: 'food' },
  { pattern: 'jumbo', operator: 'contains', category: 'food' },
  { pattern: 'lidl', operator: 'contains', category: 'food' },
  { pattern: 'aldi', operator: 'contains', category: 'food' },
  { pattern: 'plus supermarkt', operator: 'contains', category: 'food' },
  { pattern: 'thuisbezorgd', operator: 'contains', category: 'food' },
  { pattern: 'ns reizigers', operator: 'contains', category: 'transport' },
  { pattern: 'ov-chipkaart', operator: 'contains', category: 'transport' },
  { pattern: 'shell', operator: 'contains', category: 'transport' },
  { pattern: 'tinq', operator: 'contains', category: 'transport' },
  { pattern: 'netflix', operator: 'contains', category: 'entertainment' },
  { pattern: 'spotify', operator: 'contains', category: 'entertainment' },
  { pattern: 'disney plus', operator: 'contains', category: 'entertainment' },
  { pattern: 'pathe', operator: 'contains', category: 'entertainment' },
  { pattern: 'bol.com', operator: 'contains', category: 'shopping' },
  { pattern: 'coolblue', operator: 'contains', category: 'shopping' },
  { pattern: 'zalando', operator: 'contains', category: 'shopping' },
  { pattern: 'hema', operator: 'contains', category: 'shopping' },
  { pattern: 'ikea', operator: 'contains', category: 'housing' },
  { pattern: 'ziggo', operator: 'contains', category: 'housing' },
  { pattern: 'vattenfall', operator: 'contains', category: 'housing' },
  { pattern: 'salaris', operator: 'contains', category: 'income' },
];
