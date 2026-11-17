import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import AppDrawer from './AppDrawer.vue';

const meta = {
  title: 'Rules/AppDrawer',
  component: AppDrawer,
  args: { title: 'Drawer title', open: true },
  render: (args, { name }) => ({
    components: { AppDrawer },
    setup() {
      const open = ref(args.open);
      return { args, open, withFooter: name === 'With footer', long: name === 'Long body' };
    },
    template: `
      <div class="p-4">
        <UButton color="neutral" variant="outline" @click="open = true">Open drawer</UButton>
        <AppDrawer v-model:open="open" :title="args.title">
          <p v-for="n in (long ? 40 : 2)" :key="n" class="text-muted py-1">Body content, line {{ n }}</p>
          <template v-if="withFooter" #footer>
            <UButton block size="xl" class="justify-center" @click="open = false">Save</UButton>
          </template>
        </AppDrawer>
      </div>`,
  }),
} satisfies Meta<typeof AppDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fixed-height sheet, so it doesn't shift as its content changes. */
export const Default: Story = {};

/** The optional `footer` slot stays pinned below the body. */
export const WithFooter: Story = { name: 'With footer' };

/** Only the body scrolls; the header and footer stay put. */
export const LongBody: Story = { name: 'Long body' };
