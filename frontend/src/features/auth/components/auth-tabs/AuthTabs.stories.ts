import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AuthTabs from './AuthTabs.vue';

const meta = {
  title: 'Auth/AuthTabs',
  component: AuthTabs,
  args: { active: 'signin' },
  argTypes: { active: { control: 'inline-radio', options: ['signin', 'signup'] } },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof AuthTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};
export const SignUp: Story = { args: { active: 'signup' } };
