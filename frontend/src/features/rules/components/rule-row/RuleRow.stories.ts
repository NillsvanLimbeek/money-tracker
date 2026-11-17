import type { Meta, StoryObj } from '@storybook/vue3-vite';

import RuleRow from './RuleRow.vue';

const meta = {
  title: 'Rules/RuleRow',
  component: RuleRow,
  args: {
    rule: { id: '1', pattern: 'albert heijn', operator: 'contains', categoryKey: 'food', matches: 14 },
    categoryLabel: 'Food',
  },
  argTypes: { onEdit: { action: 'edit' }, onDelete: { action: 'delete' } },
  decorators: [() => ({ template: '<div class="bg-default"><story /></div>' })],
} satisfies Meta<typeof RuleRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The ⋯ button opens the actions drawer; Delete there asks for confirmation. */
export const Default: Story = {};

export const Equals: Story = {
  args: { rule: { id: '2', pattern: 'NS', operator: 'equals', categoryKey: 'transport', matches: 1 }, categoryLabel: 'Transport' },
};

export const NoMatches: Story = {
  args: { rule: { id: '3', pattern: 'netflix', operator: 'startsWith', categoryKey: 'entertainment', matches: 0 }, categoryLabel: 'Entertainment' },
};

/** A long pattern is truncated. */
export const LongPattern: Story = {
  args: { rule: { id: '4', pattern: 'a very long pattern that does not fit on one line of the screen', operator: 'contains', categoryKey: 'other', matches: 3 }, categoryLabel: 'Other' },
};
