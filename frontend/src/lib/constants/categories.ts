import type { Category } from '../types';
import { m } from '@/paraglide/messages';

export const CATEGORIES: Category[] = [
  { key: 'food', label: m.category_food() },
  { key: 'entertainment', label: m.category_entertainment() },
  { key: 'income', label: m.category_income() },
  { key: 'transport', label: m.category_transport() },
  { key: 'housing', label: m.category_housing() },
  { key: 'shopping', label: m.category_shopping() },
  { key: 'other', label: m.category_other() },
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
