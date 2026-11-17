import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SettingsRow from './SettingsRow.vue';

const meta = {
  title: 'Settings/SettingsRow',
  component: SettingsRow,
  args: { label: 'Category rules', description: '12 rules' },
  decorators: [() => ({ template: '<div class="bg-default"><story /></div>' })],
} satisfies Meta<typeof SettingsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Not interactive: a plain row with a label and description. */
export const Default: Story = {};

export const LabelOnly: Story = { args: { description: undefined } };

/** With `to` the row is a link and shows a chevron. */
export const Link: Story = { args: { to: '/settings/rules' } };

/** A tappable button that keeps the normal label colour. */
export const Pressable: Story = { args: { label: 'Date format', description: 'DD-MM-YYYY', pressable: true } };

/** Rendered in the primary colour, for actions such as exporting. */
export const Action: Story = { args: { label: 'Export transactions', description: undefined, action: true } };

/** The `trailing` slot replaces the chevron. */
export const TrailingSlot: Story = {
  render: args => ({
    components: { SettingsRow },
    setup: () => ({ args }),
    template: `
      <SettingsRow v-bind="args">
        <template #trailing><span class="text-muted font-mono text-sm">v1.0.0</span></template>
      </SettingsRow>`,
  }),
  args: { label: 'Version', description: undefined },
};
