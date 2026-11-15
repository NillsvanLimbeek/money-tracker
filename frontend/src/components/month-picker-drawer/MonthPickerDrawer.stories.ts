import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import MonthPickerDrawer from './MonthPickerDrawer.vue';

const meta = {
  title: 'Components/MonthPickerDrawer',
  component: MonthPickerDrawer,
  args: {
    open: true,
    modelValue: new Date(2026, 9, 1),
    importedMonths: ['2026-07', '2026-08', '2026-09', '2026-10'],
    today: new Date(2026, 10, 13),
  },
  argTypes: {
    open: { control: 'boolean' },
    modelValue: { control: 'date', description: 'Selected month' },
    today: { control: 'date', description: 'Decides the current month and which months are disabled' },
    importedMonths: { control: 'object', description: 'Months (`YYYY-MM`) with imported transactions' },
  },
  render: args => ({
    components: { MonthPickerDrawer },
    setup() {
      const open = ref(args.open);
      const month = ref(new Date(args.modelValue));
      // The date control hands over timestamps.
      watch(() => args.open, value => open.value = value);
      watch(() => args.modelValue, value => month.value = new Date(value));
      return { args, open, month };
    },
    template: `
      <div class="p-4">
        <UButton @click="open = true">Open drawer</UButton>
        <MonthPickerDrawer v-model:open="open" v-model="month" v-bind="{ importedMonths: args.importedMonths, today: args.today && new Date(args.today) }" />
      </div>`,
  }),
} satisfies Meta<typeof MonthPickerDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoImportedMonths: Story = { args: { importedMonths: [] } };
