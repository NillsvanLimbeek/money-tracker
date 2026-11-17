import type { Meta, StoryObj } from '@storybook/vue3-vite';

import InsightsOverview from './InsightsOverview.vue';

const meta = {
  title: 'Insights/InsightsOverview',
  component: InsightsOverview,
  args: {
    month: new Date(2026, 9, 1),
    income: 3200,
    expense: 1842.35,
    previousIncome: 3200,
    previousExpense: 2105.1,
  },
} satisfies Meta<typeof InsightsOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Spent less than last month: the expenses chip is green. */
export const Default: Story = {};

export const SpentMore: Story = { args: { expense: 2650, previousExpense: 2105.1 } };

/** Expenses above income give a negative net. */
export const Overspent: Story = { args: { income: 1800, expense: 2400 } };

/** Without income the "kept N%" line is hidden. */
export const NoIncome: Story = { args: { income: 0, previousIncome: 0, expense: 420 } };

/** Nothing in the previous month to compare with. */
export const NoPreviousMonth: Story = { args: { previousIncome: 0, previousExpense: 0 } };
