import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { Transaction } from '@/lib/types';

import SpendingByCategory from './SpendingByCategory.vue';

let nextId = 0;
function expense(month: number, categoryKey: string, merchant: string, amount: number): Transaction {
  nextId += 1;
  return { id: String(nextId), date: new Date(2026, month, 10), merchant, amount: -amount, categoryKey };
}

const OCTOBER = [
  expense(9, 'housing', 'Huur', 950),
  expense(9, 'food', 'Albert Heijn', 312.5),
  expense(9, 'food', 'Jumbo', 170),
  expense(9, 'transport', 'NS Reizigers', 96.4),
  expense(9, 'other', 'Bol.com', 313.45),
];

const SEPTEMBER = [
  expense(8, 'housing', 'Huur', 950),
  expense(8, 'food', 'Albert Heijn', 430),
  expense(8, 'transport', 'NS Reizigers', 117.6),
  expense(8, 'other', 'Bol.com', 300),
];

const meta = {
  title: 'Insights/SpendingByCategory',
  component: SpendingByCategory,
  args: {
    month: new Date(2026, 9, 1),
    transactions: OCTOBER,
    previousTransactions: SEPTEMBER,
  },
  decorators: [() => ({ template: '<div class="px-4"><story /></div>' })],
} satisfies Meta<typeof SpendingByCategory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a donut segment to dim the other rows. */
export const Default: Story = {};

/** Without a previous month every change reads as new spending. */
export const NoPreviousMonth: Story = { args: { previousTransactions: [] } };

export const Empty: Story = { args: { transactions: [], previousTransactions: [] } };
