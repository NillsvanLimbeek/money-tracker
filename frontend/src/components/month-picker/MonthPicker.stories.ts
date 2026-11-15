import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import MonthPicker from './MonthPicker.vue';

const meta = {
  title: 'Components/MonthPicker',
  component: MonthPicker,
  args: { modelValue: new Date(2026, 9, 1) },
  argTypes: {
    onOpen: { action: 'open' },
    modelValue: { control: 'date', description: 'Selected month' },
  },
  render: args => ({
    components: { MonthPicker },
    setup() {
      const month = ref(new Date(args.modelValue));
      // The date control hands over a timestamp.
      watch(() => args.modelValue, value => month.value = new Date(value));
      return { args, month };
    },
    template: '<MonthPicker v-model="month" @open="args.onOpen" />',
  }),
} satisfies Meta<typeof MonthPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The arrows shift the month; the middle button emits `open`. */
export const Default: Story = {};
