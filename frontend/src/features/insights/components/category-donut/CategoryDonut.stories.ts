import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CategoryDonut from './CategoryDonut.vue';

const SPENDS = [
  { categoryKey: 'housing', amount: 950, share: 52, change: 0 },
  { categoryKey: 'food', amount: 482.5, share: 26, change: 12 },
  { categoryKey: 'transport', amount: 96.4, share: 5, change: -18 },
  { categoryKey: 'other', amount: 313.45, share: 17, change: 4 },
];

const meta = {
  title: 'Insights/CategoryDonut',
  component: CategoryDonut,
  args: { spends: SPENDS, activeKey: null },
  argTypes: {
    activeKey: { control: 'select', options: [null, ...SPENDS.map(spend => spend.categoryKey)] },
    onSelect: { action: 'select' },
  },
  render: args => ({
    components: { CategoryDonut },
    setup: () => ({ args }),
    template: `
      <div class="bg-default p-6">
        <CategoryDonut v-bind="args" @select="args.onSelect">
          <span class="text-muted font-mono text-xs tracking-widest uppercase">Spent in October</span>
          <span class="text-highlighted font-mono text-3xl font-bold">€1.842</span>
        </CategoryDonut>
      </div>`,
  }),
} satisfies Meta<typeof CategoryDonut>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a segment to emit `select` with its category key. */
export const Default: Story = {};

/** The other segments are dimmed. */
export const Highlighted: Story = { args: { activeKey: 'food' } };

export const SingleCategory: Story = {
  args: { spends: [{ categoryKey: 'food', amount: 120, share: 100, change: 0 }] },
};
