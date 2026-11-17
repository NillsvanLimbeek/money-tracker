import type { Meta, StoryObj } from '@storybook/vue3-vite';

import RulePreview from './RulePreview.vue';

const meta = {
  title: 'Rules/RulePreview',
  component: RulePreview,
  args: {
    preview: {
      count: 14,
      descriptions: [
        { description: 'Albert Heijn 1234', count: 9, date: '2026-10-18', amountCents: -5230 },
        { description: 'Albert Heijn Amsterdam', count: 4, date: '2026-10-09', amountCents: -2310 },
        { description: 'AH to go Centraal', count: 1, date: '2026-09-27', amountCents: -895 },
      ],
    },
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
} satisfies Meta<typeof RulePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `×N` shows how many transactions share a description. */
export const Default: Story = {};

export const NoMatches: Story = { args: { preview: { count: 0, descriptions: [] } } };

/** The list scrolls once it grows past its maximum height. */
export const ManyDescriptions: Story = {
  args: {
    preview: {
      count: 40,
      descriptions: Array.from({ length: 12 }, (_, index) => ({
        description: `Jumbo filiaal ${index + 1}`,
        count: index % 3 + 1,
        date: '2026-10-12',
        amountCents: -(1500 + index * 230),
      })),
    },
  },
};
