import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { CATEGORIES } from '@/lib/constants/categories';
import CategorySelect from './CategorySelect.vue';

const meta = {
  title: 'Rules/CategorySelect',
  component: CategorySelect,
  args: { categories: CATEGORIES, modelValue: null },
  render: args => ({
    components: { CategorySelect },
    setup() {
      // v-model only, so keep the selection in a ref to make it clickable.
      const selected = ref(args.modelValue);
      return { args, selected };
    },
    template: '<div class="p-4"><CategorySelect v-model="selected" :categories="args.categories" /></div>',
  }),
} satisfies Meta<typeof CategorySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingSelected: Story = {};
export const Selected: Story = { args: { modelValue: 'transport' } };
