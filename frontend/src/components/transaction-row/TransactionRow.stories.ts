import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { CATEGORIES } from '@/lib/constants/categories';
import TransactionRow from './TransactionRow.vue';

const meta = {
  title: 'Components/TransactionRow',
  component: TransactionRow,
  args: {
    categories: CATEGORIES,
    transaction: {
      id: '1',
      date: new Date(2026, 9, 16),
      merchant: 'Albert Heijn',
      amount: -43.2,
      categoryKey: 'food',
      notes: 'Name: Albert Heijn 1234\nDescription: Pasvolgnr: 012 16-10-2026 14:32',
    },
  },
  argTypes: {
    pickerOpen: { control: 'boolean' },
    selectable: { control: 'boolean' },
    selected: { control: 'boolean' },
    duplicate: { control: 'boolean' },
    grouped: { control: 'boolean' },
    onTogglePicker: { action: 'togglePicker' },
    onClosePicker: { action: 'closePicker' },
    onSelectCategory: { action: 'selectCategory' },
    onToggle: { action: 'toggle' },
  },
  decorators: [() => ({ template: '<div class="bg-default"><story /></div>' })],
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the row to expand the bank description. */
export const Default: Story = {};

export const Income: Story = {
  args: {
    transaction: { id: '2', date: new Date(2026, 9, 25), merchant: 'Salary', amount: 3200, categoryKey: 'income' },
  },
};

export const PickerOpen: Story = { args: { pickerOpen: true } };
export const Grouped: Story = { args: { grouped: true } };
export const Selectable: Story = { args: { selectable: true, selected: true } };
export const Duplicate: Story = { args: { selectable: true, duplicate: true } };
