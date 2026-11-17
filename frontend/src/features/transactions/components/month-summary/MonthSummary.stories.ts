import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MonthSummary from './MonthSummary.vue';

const meta = {
  title: 'Transactions/MonthSummary',
  component: MonthSummary,
  args: { income: 3200, expense: 1842.35 },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof MonthSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Expenses above income give a negative net. */
export const Overspent: Story = { args: { income: 1800, expense: 2400 } };

export const Empty: Story = { args: { income: 0, expense: 0 } };
