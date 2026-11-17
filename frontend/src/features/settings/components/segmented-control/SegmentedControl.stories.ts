import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import SegmentedControl from './SegmentedControl.vue';

interface Args {
  options: { value: string; label: string }[];
  modelValue: string;
  ariaLabel: string;
}

const meta: Meta<Args> = {
  title: 'Settings/SegmentedControl',
  // The generic SFC type doesn't satisfy Storybook's component type.
  component: SegmentedControl as never,
  args: {
    options: [{ value: 'en', label: 'EN' }, { value: 'nl', label: 'NL' }],
    modelValue: 'en',
    ariaLabel: 'Language',
  },
  render: args => ({
    components: { SegmentedControl: SegmentedControl as never },
    setup() {
      // v-model only, so keep the selection in a ref to make it clickable.
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<div class="p-4"><SegmentedControl v-model="value" :options="args.options" :aria-label="args.ariaLabel" /></div>',
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const ThreeOptions: Story = {
  args: {
    options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }],
    modelValue: 'system',
    ariaLabel: 'Theme',
  },
};
