import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import RulePromptDrawer from './RulePromptDrawer.vue';

const PREVIEW = {
  count: 14,
  descriptions: [
    { description: 'Albert Heijn 1234', count: 9, date: '2026-10-18', amountCents: -5230 },
    { description: 'Albert Heijn Amsterdam', count: 5, date: '2026-10-09', amountCents: -2310 },
  ],
};

const meta = {
  title: 'Transactions/RulePromptDrawer',
  component: RulePromptDrawer,
  args: {
    category: { key: 'food', label: 'Food' },
    rules: [{ id: '1', pattern: 'jumbo', operator: 'contains', categoryKey: 'food', matches: 9 }],
    preview: PREVIEW,
    pending: false,
    open: true,
    pattern: 'albert heijn',
  },
  argTypes: { onCreate: { action: 'create' } },
  render: args => ({
    components: { RulePromptDrawer },
    setup() {
      const open = ref(args.open);
      const pattern = ref(args.pattern);
      return { args, open, pattern };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer</UButton>
        <RulePromptDrawer
          v-model:open="open"
          v-model:pattern="pattern"
          :category="args.category"
          :rules="args.rules"
          :preview="args.preview"
          :pending="args.pending"
          @create="args.onCreate"
        />
      </div>`,
  }),
} satisfies Meta<typeof RulePromptDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shown after a manual category change: offers a `contains` rule from the description. */
export const Default: Story = {};

/** Before the match lookup returns there is no count yet. */
export const NoPreview: Story = { args: { preview: undefined } };

/** A pattern that is too short only warns; it can still be created. */
export const ShortPatternWarning: Story = { args: { pattern: 'ah' } };

/** An empty pattern is an error, so Create rule is disabled. */
export const EmptyPattern: Story = { args: { pattern: '', preview: undefined } };

/** The same pattern as an existing rule is an error. */
export const DuplicatePattern: Story = { args: { pattern: 'jumbo' } };

export const Pending: Story = { args: { pending: true } };
