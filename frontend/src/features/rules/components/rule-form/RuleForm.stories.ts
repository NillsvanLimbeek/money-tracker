import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { CATEGORIES } from '@/lib/constants/categories';
import RuleForm from './RuleForm.vue';

const EXISTING = [
  { id: '1', pattern: 'albert heijn', operator: 'contains' as const, categoryKey: 'food', matches: 14 },
];

const PREVIEW = {
  count: 14,
  descriptions: [
    { description: 'Albert Heijn 1234', count: 9, date: '2026-10-18', amountCents: -5230 },
    { description: 'Albert Heijn Amsterdam', count: 5, date: '2026-10-09', amountCents: -2310 },
  ],
};

const meta = {
  title: 'Rules/RuleForm',
  component: RuleForm,
  args: {
    categories: CATEGORIES,
    rules: EXISTING,
    preview: undefined,
    pending: false,
    editingId: undefined,
    open: true,
    operator: 'contains',
    pattern: '',
    categoryKey: null,
  },
  argTypes: { onSave: { action: 'save' }, onSaveAndApply: { action: 'saveAndApply' }, onEditExisting: { action: 'editExisting' } },
  render: args => ({
    components: { RuleForm },
    setup() {
      // The form is all v-models, so keep the draft in refs to make it editable.
      const open = ref(args.open);
      const operator = ref(args.operator);
      const pattern = ref(args.pattern);
      const categoryKey = ref(args.categoryKey);
      return { args, open, operator, pattern, categoryKey };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer</UButton>
        <RuleForm
          v-model:open="open"
          v-model:operator="operator"
          v-model:pattern="pattern"
          v-model:category-key="categoryKey"
          :categories="args.categories"
          :rules="args.rules"
          :preview="args.preview"
          :pending="args.pending"
          :editing-id="args.editingId"
          @save="args.onSave"
          @save-and-apply="args.onSaveAndApply"
          @edit-existing="args.onEditExisting"
        />
      </div>`,
  }),
} satisfies Meta<typeof RuleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {};

/** The preview shows once the pattern has text and a lookup has returned. */
export const WithPreview: Story = { args: { pattern: 'albert', categoryKey: 'food', preview: PREVIEW } };

export const Editing: Story = {
  args: { editingId: '1', pattern: 'albert heijn', categoryKey: 'food', preview: PREVIEW },
};

/** A pattern that is too short only warns; it can still be saved. */
export const ShortPatternWarning: Story = { args: { pattern: 'ah', categoryKey: 'food' } };

/** The same pattern and operator as an existing rule is an error, with a link to edit that rule. */
export const DuplicatePattern: Story = { args: { pattern: 'albert heijn', categoryKey: 'food' } };

export const Pending: Story = { args: { pattern: 'albert', categoryKey: 'food', pending: true } };
