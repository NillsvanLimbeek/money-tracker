import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { CATEGORIES } from '@/lib/constants/categories';
import CategoryPicker from './CategoryPicker.vue';

const meta = {
  title: 'Components/CategoryPicker',
  component: CategoryPicker,
  args: { categories: CATEGORIES, selectedKey: 'food' },
  argTypes: {
    selectedKey: { control: 'select', options: CATEGORIES.map(category => category.key) },
    categories: { control: 'object' },
    onSelect: { action: 'select' },
    onClose: { action: 'close' },
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof CategoryPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OtherSelected: Story = { args: { selectedKey: 'transport' } };
