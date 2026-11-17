import type { Meta, StoryObj } from '@storybook/vue3-vite';

import RulesEmptyState from './RulesEmptyState.vue';

const meta = {
  title: 'Rules/RulesEmptyState',
  component: RulesEmptyState,
  args: { suggestPending: false },
  argTypes: { onAdd: { action: 'add' }, onSuggest: { action: 'suggest' } },
} satisfies Meta<typeof RulesEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The suggested rules button shows a spinner while they are added. */
export const SuggestPending: Story = { args: { suggestPending: true } };
