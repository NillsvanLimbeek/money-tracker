import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { Transaction } from '@/lib/types';
import { ref } from 'vue';

import { CATEGORIES } from '@/lib/constants/categories';
import TransactionList from './TransactionList.vue';

const TRANSACTIONS: Transaction[] = [
  { id: '1', date: new Date(2026, 9, 18), merchant: 'Albert Heijn', amount: -52.3, categoryKey: 'food', notes: 'Name: Albert Heijn 1234\nDescription: Pasvolgnr: 012 18-10-2026 14:32' },
  { id: '2', date: new Date(2026, 9, 18), merchant: 'NS Reizigers', amount: -43.5, categoryKey: 'transport' },
  { id: '3', date: new Date(2026, 9, 16), merchant: 'Werkgever BV', amount: 3200, categoryKey: 'income' },
  { id: '4', date: new Date(2026, 9, 14), merchant: 'Spotify', amount: -11.99, categoryKey: 'entertainment' },
  { id: '5', date: new Date(2026, 9, 2), merchant: 'Huur', amount: -950, categoryKey: 'housing' },
  { id: '6', date: new Date(2026, 9, 2), merchant: 'Onbekende afschrijving', amount: -24.5, categoryKey: 'other' },
];

const meta = {
  title: 'Transactions/TransactionList',
  component: TransactionList,
  args: { transactions: TRANSACTIONS, categories: CATEGORIES },
  argTypes: { onChangeCategory: { action: 'changeCategory' } },
  render: args => ({
    components: { TransactionList },
    setup() {
      // Apply a category change locally so the picker can be tried out.
      const transactions = ref(args.transactions);
      function change(payload: { id: string; categoryKey: string }): void {
        transactions.value = transactions.value.map(item => item.id === payload.id ? { ...item, categoryKey: payload.categoryKey } : item);
        args.onChangeCategory?.(payload);
      }
      return { args, transactions, change };
    },
    template: '<TransactionList :transactions="transactions" :categories="args.categories" @change-category="change" />',
  }),
} satisfies Meta<typeof TransactionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grouped by day with a daily total. Click a category badge to change it; only one picker is open at a time. */
export const Default: Story = {};

export const SingleDay: Story = { args: { transactions: TRANSACTIONS.slice(0, 2) } };

export const Empty: Story = { args: { transactions: [] } };
