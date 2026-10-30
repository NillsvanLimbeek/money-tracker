import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { key: 'food', label: 'Food' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'income', label: 'Income' },
  { key: 'transport', label: 'Transport' },
  { key: 'housing', label: 'Housing' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'other', label: 'Other' },
];

export const CATEGORY_ICONS: Record<string, string> = {
  food: 'i-lucide-utensils',
  entertainment: 'i-lucide-circle-play',
  income: 'i-lucide-arrow-down-to-line',
  transport: 'i-lucide-train-front',
  housing: 'i-lucide-house',
  shopping: 'i-lucide-shopping-bag',
  other: 'i-lucide-ellipsis',
};
