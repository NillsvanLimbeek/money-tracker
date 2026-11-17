import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { CATEGORIES } from '@/lib/constants/categories';
import CategoryDrawer from './CategoryDrawer.vue';

const meta = {
  title: 'Transactions/CategoryDrawer',
  component: CategoryDrawer,
  args: { categories: CATEGORIES, selectedCategories: [], open: false },
  argTypes: { onResetCategories: { action: 'resetCategories' }, onToggleCategory: { action: 'toggleCategory' } },
  render: args => ({
    components: { CategoryDrawer },
    setup() {
      // Keep the selection locally so the chips can be toggled.
      const open = ref(args.open);
      const selected = ref([...args.selectedCategories]);
      function toggle(key: string): void {
        selected.value = selected.value.includes(key) ? selected.value.filter(item => item !== key) : [...selected.value, key];
        args.onToggleCategory?.(key);
      }
      function reset(): void {
        selected.value = [];
        args.onResetCategories?.();
      }
      return { args, open, selected, toggle, reset };
    },
    template: `
      <div class="p-4">
        <CategoryDrawer
          v-model:open="open"
          :categories="args.categories"
          :selected-categories="selected"
          @toggle-category="toggle"
          @reset-categories="reset"
        />
      </div>`,
  }),
} satisfies Meta<typeof CategoryDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The trigger button reads "Filter" until a category is selected. */
export const Closed: Story = {};

export const Open: Story = { args: { open: true } };

/** With filters active the trigger is tinted and shows the count. */
export const WithFilters: Story = { args: { open: true, selectedCategories: ['food', 'transport'] } };
