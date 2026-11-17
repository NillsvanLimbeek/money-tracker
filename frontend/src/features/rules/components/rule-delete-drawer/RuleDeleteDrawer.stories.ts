import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import RuleDeleteDrawer from './RuleDeleteDrawer.vue';

const meta = {
  title: 'Rules/RuleDeleteDrawer',
  component: RuleDeleteDrawer,
  args: {
    rule: { id: '1', pattern: 'albert heijn', operator: 'contains', categoryKey: 'food', matches: 14 },
    open: true,
  },
  argTypes: { onDelete: { action: 'delete' } },
  render: args => ({
    components: { RuleDeleteDrawer },
    setup() {
      const open = ref(args.open);
      return { args, open };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer</UButton>
        <RuleDeleteDrawer v-model:open="open" :rule="args.rule" @delete="args.onDelete" />
      </div>`,
  }),
} satisfies Meta<typeof RuleDeleteDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cancel closes the drawer; Delete emits `delete`. */
export const Default: Story = {};

export const NoMatches: Story = {
  args: { rule: { id: '2', pattern: 'netflix', operator: 'startsWith', categoryKey: 'entertainment', matches: 0 } },
};
