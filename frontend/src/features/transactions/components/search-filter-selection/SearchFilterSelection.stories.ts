import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { Transaction } from '@/lib/types';

import SearchFilterSelection from './SearchFilterSelection.vue';

function transaction(id: string, categoryKey: string, amount: number): Transaction {
  return { id, date: new Date(2026, 9, 10), merchant: 'Shop', amount, categoryKey };
}

const TRANSACTIONS = [
  transaction('1', 'food', -12),
  transaction('2', 'food', -31),
  transaction('3', 'transport', -4),
  transaction('4', 'housing', -950),
  transaction('5', 'income', 3200),
];

const meta = {
  title: 'Transactions/SearchFilterSelection',
  component: SearchFilterSelection,
  args: {
    selectedCategories: ['food'],
    selectedCategoryItems: [{ key: 'food', label: 'Food' }],
    transactions: TRANSACTIONS,
    filteredTransactions: TRANSACTIONS.slice(0, 2),
  },
  argTypes: { onClear: { action: 'clear' } },
} satisfies Meta<typeof SearchFilterSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneCategory: Story = {};

export const SeveralCategories: Story = {
  args: {
    selectedCategories: ['food', 'transport'],
    selectedCategoryItems: [{ key: 'food', label: 'Food' }, { key: 'transport', label: 'Transport' }],
    filteredTransactions: TRANSACTIONS.slice(0, 3),
  },
};

/** The banner only shows while a category is selected. */
export const NoCategories: Story = {
  args: { selectedCategories: [], selectedCategoryItems: [], filteredTransactions: TRANSACTIONS },
};
