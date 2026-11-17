import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Chip from './Chip.vue';

const meta = {
  title: 'Rules/Chip',
  component: Chip,
  args: { chip: { key: 'food', label: 'Food', count: 8 }, selected: null },
  argTypes: { onSelect: { action: 'select' } },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `selected` holds the key of the active chip. */
export const Selected: Story = { args: { selected: 'food' } };

/** Another chip is active, so this one stays plain. */
export const OtherSelected: Story = { args: { selected: 'housing' } };
