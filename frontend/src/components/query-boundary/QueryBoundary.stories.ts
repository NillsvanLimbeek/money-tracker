import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed } from 'vue';

import QueryBoundary from './QueryBoundary.vue';

// The boundary takes a query object; build a fake one from simple controls.
interface Args {
  state: 'loading' | 'error' | 'success';
  errorMessage: string;
  data: string;
}

const meta: Meta<Args> = {
  title: 'Components/QueryBoundary',
  // The generic SFC type doesn't satisfy Storybook's component type.
  component: QueryBoundary as never,
  args: { state: 'success', errorMessage: 'Could not load transactions', data: '42 transactions' },
  argTypes: {
    state: { control: 'inline-radio', options: ['loading', 'error', 'success'], description: 'State of the query' },
    errorMessage: { control: 'text', if: { arg: 'state', eq: 'error' } },
    data: { control: 'text', description: 'Passed to the default slot', if: { arg: 'state', eq: 'success' } },
  },
  render: args => ({
    components: { QueryBoundary: QueryBoundary as never },
    setup() {
      // Only the refs the boundary reads are needed.
      const query = {
        isLoading: computed(() => args.state === 'loading'),
        error: computed(() => args.state === 'error' ? new Error(args.errorMessage) : null),
        data: computed(() => args.data),
      };
      return { query: query as unknown as UseQueryReturnType<string, Error> };
    },
    template: `
      <div class="p-4">
        <QueryBoundary :query="query" v-slot="{ data }">Loaded: {{ data }}</QueryBoundary>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Loaded: Story = {};
export const Loading: Story = { args: { state: 'loading' } };
export const Errored: Story = { args: { state: 'error' } };
