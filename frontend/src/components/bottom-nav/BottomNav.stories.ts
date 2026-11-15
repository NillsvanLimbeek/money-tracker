import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import BottomNav from './BottomNav.vue';

// BottomNav has no props: it reads the current route. `path` drives the memory router.
interface Args { path: string }

const meta: Meta<Args> = {
  title: 'Components/BottomNav',
  component: BottomNav,
  parameters: { layout: 'fullscreen' },
  args: { path: '/' },
  argTypes: {
    path: {
      control: 'select',
      options: ['/', '/insights', '/budgets', '/settings'],
      description: 'Current route. The ledger route (`/`) also shows the import button.',
    },
  },
  render: args => ({
    components: { BottomNav },
    setup() {
      const router = useRouter();
      watchEffect(() => {
        router.push(args.path);
      });
    },
    template: '<div class="h-40"><BottomNav /></div>',
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Ledger: Story = {};
export const Insights: Story = { args: { path: '/insights' } };
export const Settings: Story = { args: { path: '/settings' } };
