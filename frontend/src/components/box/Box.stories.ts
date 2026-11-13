import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Box from './Box.vue';

const meta = {
  title: 'Components/Box',
  component: Box,
  render: () => ({
    components: { Box },
    template: '<Box><span>Groceries</span><strong>€ 42,00</strong></Box>',
  }),
} satisfies Meta<typeof Box>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
