import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageHeader from './PageHeader.vue';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: { title: 'Insights' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  render: args => ({
    components: { PageHeader },
    setup: () => ({ args }),
    template: `
      <PageHeader v-bind="args">
        <template #left><UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back" /></template>
        <template #right><UButton color="neutral" variant="ghost" icon="i-lucide-settings" aria-label="Settings" /></template>
      </PageHeader>`,
  }),
};
