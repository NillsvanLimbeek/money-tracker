import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TransactionDescription from './TransactionDescription.vue';

const meta = {
  title: 'Components/TransactionDescription',
  component: TransactionDescription,
  args: {
    noteLines: ['Name: Albert Heijn 1234', 'Description: Pasvolgnr: 012 16-10-2026 14:32', 'IBAN: NL12INGB0001234567'],
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof TransactionDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleLine: Story = { args: { noteLines: ['Monthly rent October'] } };
