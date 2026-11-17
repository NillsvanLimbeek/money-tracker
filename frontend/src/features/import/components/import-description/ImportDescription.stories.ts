import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ImportDescription from './ImportDescription.vue';

const meta = {
  title: 'Import/ImportDescription',
  component: ImportDescription,
  args: {
    title: 'Choose a file',
    subtitle: 'Export your transactions from ING as a CSV file and add it here.',
  },
} satisfies Meta<typeof ImportDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    title: 'Review the transactions before they are imported',
    subtitle: 'Transactions that were imported before are marked and left unticked. Untick anything you do not want to add, then confirm to import the rest.',
  },
};
