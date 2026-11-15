import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Box from './Box.vue';

// Box has no props, only a default slot; expose its content as controls.
interface Args { label: string; amount: string }

const meta: Meta<Args> = {
  title: 'Components/Box',
  component: Box,
  args: { label: 'Groceries', amount: '€ 42,00' },
  argTypes: {
    label: { control: 'text', description: 'Text on the left (slot content)' },
    amount: { control: 'text', description: 'Text on the right (slot content)' },
  },
  render: args => ({
    components: { Box },
    setup: () => ({ args }),
    template: '<Box><span>{{ args.label }}</span><strong>{{ args.amount }}</strong></Box>',
  }),
};

export default meta;

export const Default: StoryObj<Args> = {};
