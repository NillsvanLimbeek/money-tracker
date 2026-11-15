import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DesktopBlocker from './DesktopBlocker.vue';

const meta = {
  title: 'Components/DesktopBlocker',
  component: DesktopBlocker,
} satisfies Meta<typeof DesktopBlocker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
