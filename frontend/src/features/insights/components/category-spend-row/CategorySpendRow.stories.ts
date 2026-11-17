import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CategorySpendRow from './CategorySpendRow.vue';

const meta = {
  title: 'Insights/CategorySpendRow',
  component: CategorySpendRow,
  args: {
    spend: { categoryKey: 'food', amount: 482.5, share: 26, change: 12 },
    dimmed: false,
  },
  decorators: [() => ({ template: '<div class="bg-default p-4"><story /></div>' })],
} satisfies Meta<typeof CategorySpendRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Spending up on last month is red. */
export const SpendingUp: Story = {};

/** Spending down on last month is green. */
export const SpendingDown: Story = {
  args: { spend: { categoryKey: 'transport', amount: 96.4, share: 5, change: -18 } },
};

export const NoChange: Story = {
  args: { spend: { categoryKey: 'housing', amount: 950, share: 52, change: 0 } },
};

/** Faded while another category is highlighted in the donut. */
export const Dimmed: Story = { args: { dimmed: true } };

/** A category without its own colour or icon falls back to "other". */
export const UnknownCategory: Story = {
  args: { spend: { categoryKey: 'something-else', amount: 12, share: 1, change: 0 } },
};
