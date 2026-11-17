import type { Meta, StoryObj } from '@storybook/vue3-vite';

import StatStrip from './StatStrip.vue';

const meta = {
  title: 'Import/StatStrip',
  component: StatStrip,
  args: {
    stats: [
      { label: 'Found', value: 42 },
      { label: 'Selected', value: 38, valueClass: 'text-primary' },
      { label: 'Duplicates', value: 4 },
    ],
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof StatStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `valueClass` replaces the default value colour. */
export const Default: Story = {};

export const Amounts: Story = {
  args: {
    stats: [
      { label: 'In', value: '€ 3.200,00', valueClass: 'text-primary' },
      { label: 'Out', value: '- € 1.842,35' },
      { label: 'Skipped', value: 0 },
    ],
  },
};

export const TwoStats: Story = {
  args: { stats: [{ label: 'Found', value: 12 }, { label: 'Selected', value: 12, valueClass: 'text-primary' }] },
};
