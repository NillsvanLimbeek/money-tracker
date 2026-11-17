import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import RuleActions from './RuleActions.vue';

const meta = {
  title: 'Rules/RuleActions',
  component: RuleActions,
  args: {
    rule: { id: '1', pattern: 'albert heijn', operator: 'contains', categoryKey: 'food', matches: 14 },
    categoryLabel: 'Food',
    open: true,
  },
  argTypes: { onEdit: { action: 'edit' }, onDelete: { action: 'delete' } },
  render: args => ({
    components: { RuleActions },
    setup() {
      const open = ref(args.open);
      return { args, open };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer</UButton>
        <RuleActions v-model:open="open" :rule="args.rule" :category-label="args.categoryLabel" @edit="args.onEdit" @delete="args.onDelete" />
      </div>`,
  }),
} satisfies Meta<typeof RuleActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
