import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CurrencyAmount from './CurrencyAmount.vue';

const meta = {
  title: 'Components/CurrencyAmount',
  component: CurrencyAmount,
  args: { label: 'Expenses', value: 1234.5 },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof CurrencyAmount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AlignedEnd: Story = { args: { align: 'end' } };
export const Negative: Story = { args: { label: 'Net', value: -312.4 } };
