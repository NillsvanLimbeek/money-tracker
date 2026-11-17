import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SettingsRow from '../settings-row/SettingsRow.vue';
import SettingsSection from './SettingsSection.vue';

const meta = {
  title: 'Settings/SettingsSection',
  component: SettingsSection,
  args: { title: 'Language & region' },
  render: args => ({
    components: { SettingsSection, SettingsRow },
    setup: () => ({ args }),
    template: `
      <div class="p-4">
        <SettingsSection v-bind="args">
          <SettingsRow label="Number format" description="1.234,56" to="/settings/number" />
          <SettingsRow label="Date format" description="DD-MM-YYYY" to="/settings/date" />
        </SettingsSection>
      </div>`,
  }),
} satisfies Meta<typeof SettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A titled card; the rows inside are separated by dividers. */
export const Default: Story = {};
