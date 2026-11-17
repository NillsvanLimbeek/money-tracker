import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DeltaChip from './DeltaChip.vue';

const meta = {
  title: 'Insights/DeltaChip',
  component: DeltaChip,
  args: { label: '+12% vs Sep', delta: 12, upIsGood: true },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof DeltaChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An increase in something good, such as income. */
export const UpIsGood: Story = {};
export const DownIsBad: Story = { args: { label: '-8% vs Sep', delta: -8 } };

/** For expenses an increase is bad news and a decrease is good news. */
export const UpIsBad: Story = { args: { delta: 12, upIsGood: false } };
export const DownIsGood: Story = { args: { label: '-8% vs Sep', delta: -8, upIsGood: false } };

export const Neutral: Story = { args: { label: '±0% vs Sep', delta: 0 } };
