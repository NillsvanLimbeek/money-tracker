import type { Meta, StoryObj } from '@storybook/vue3-vite';

import RuleGroup from './RuleGroup.vue';

const meta = {
  title: 'Rules/RuleGroup',
  component: RuleGroup,
  args: {
    group: {
      category: { key: 'food', label: 'Food' },
      matches: 23,
      rules: [
        { id: '1', pattern: 'albert heijn', operator: 'contains', categoryKey: 'food', matches: 14 },
        { id: '2', pattern: 'jumbo', operator: 'startsWith', categoryKey: 'food', matches: 9 },
      ],
    },
  },
  argTypes: { onEdit: { action: 'edit' }, onDelete: { action: 'delete' } },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof RuleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleRule: Story = {
  args: {
    group: {
      category: { key: 'transport', label: 'Transport' },
      matches: 1,
      rules: [{ id: '3', pattern: 'NS', operator: 'equals', categoryKey: 'transport', matches: 1 }],
    },
  },
};
