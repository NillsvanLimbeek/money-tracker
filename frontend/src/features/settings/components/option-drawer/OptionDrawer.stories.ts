import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import OptionDrawer from './OptionDrawer.vue';

interface Args {
  title: string;
  options: { value: string; label: string }[];
  modelValue: string;
}

const meta: Meta<Args> = {
  title: 'Settings/OptionDrawer',
  // The generic SFC type doesn't satisfy Storybook's component type.
  component: OptionDrawer as never,
  args: {
    title: 'Number format',
    options: [{ value: 'nl', label: '1.234,56' }, { value: 'en', label: '1,234.56' }],
    modelValue: 'nl',
  },
  render: args => ({
    components: { OptionDrawer: OptionDrawer as never },
    setup() {
      const open = ref(true);
      const value = ref(args.modelValue);
      return { args, open, value };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer ({{ value }})</UButton>
        <OptionDrawer v-model:open="open" v-model="value" :title="args.title" :options="args.options" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<Args>;

/** Choosing an option selects it and closes the drawer. */
export const Default: Story = {};

export const DateFormat: Story = {
  args: {
    title: 'Date format',
    options: [{ value: 'dmy', label: 'DD-MM-YYYY' }, { value: 'mdy', label: 'MM-DD-YYYY' }],
    modelValue: 'mdy',
  },
};
