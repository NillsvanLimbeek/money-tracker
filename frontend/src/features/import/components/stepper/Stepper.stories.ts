import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Stepper from './Stepper.vue';

const meta = {
  title: 'Import/Stepper',
  component: Stepper,
  args: { stepCount: 2, step: 1 },
  argTypes: {
    stepCount: { control: { type: 'number', min: 1, max: 6 } },
    step: { control: { type: 'number', min: 0, max: 6 }, description: 'Steps up to and including this one are filled' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};
export const SecondStep: Story = { args: { step: 2 } };
export const ThreeSteps: Story = { args: { stepCount: 3, step: 2 } };
