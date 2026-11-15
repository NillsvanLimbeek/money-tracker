import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CategoryBadge from './CategoryBadge.vue';

const meta = {
  title: 'Components/CategoryBadge',
  component: CategoryBadge,
  args: { categoryKey: 'food', label: 'Food' },
  argTypes: {
    onClick: { action: 'click' },
    label: { control: 'text' },
    showIcon: { control: 'boolean' },
    selected: { control: 'boolean' },
    interactive: { control: 'boolean' },
    categoryKey: {
      control: 'select',
      options: ['food', 'entertainment', 'income', 'transport', 'housing', 'shopping', 'other'],
    },
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof CategoryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const WithoutIcon: Story = { args: { showIcon: false } };
/** Renders a plain span, for use inside another interactive element. */
export const NonInteractive: Story = { args: { interactive: false } };
export const Transport: Story = { args: { categoryKey: 'transport', label: 'Transport' } };
