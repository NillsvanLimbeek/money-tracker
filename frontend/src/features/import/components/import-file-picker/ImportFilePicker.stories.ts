import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ImportFilePicker from './ImportFilePicker.vue';

const meta = {
  title: 'Import/ImportFilePicker',
  component: ImportFilePicker,
  argTypes: { onSelect: { action: 'select' } },
} satisfies Meta<typeof ImportFilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Choose a CSV or drop one on the box to emit `select` with the file. */
export const Default: Story = {};
