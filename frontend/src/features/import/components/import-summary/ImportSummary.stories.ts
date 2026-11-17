import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ImportRow } from '@/lib/types';

import ImportSummary from './ImportSummary.vue';

function row(date: string, amountCents: number, description: string): ImportRow {
  return { date, description, amountCents, rawCounterparty: null, mutationType: null, notes: null, importHash: `${date}-${description}` };
}

const meta = {
  title: 'Import/ImportSummary',
  component: ImportSummary,
  args: {
    summary: { imported: 6, skipped: 2, uncategorised: 3 },
    rows: [
      row('2026-10-18', -5230, 'Albert Heijn'),
      row('2026-10-16', 340000, 'Werkgever BV'),
      row('2026-10-14', -1199, 'Spotify'),
      row('2026-10-02', -4350, 'NS Reizigers'),
      row('2026-09-30', -95000, 'Huur'),
      row('2026-09-12', -2480, 'Jumbo'),
    ],
    fileName: 'NL00INGB0000000000_2026.csv',
  },
  argTypes: { onReset: { action: 'reset' } },
} satisfies Meta<typeof ImportSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without uncategorised transactions the link to the ledger is hidden. */
export const AllCategorised: Story = {
  args: { summary: { imported: 6, skipped: 0, uncategorised: 0 } },
};
