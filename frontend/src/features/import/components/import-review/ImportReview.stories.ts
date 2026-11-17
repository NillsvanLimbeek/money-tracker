import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ImportRow } from '@/lib/types';

import ImportReview from './ImportReview.vue';

function row(date: string, amountCents: number, description: string, notes: string | null = null): ImportRow {
  return { date, description, amountCents, rawCounterparty: null, mutationType: null, notes, importHash: `${date}-${description}` };
}

const ROWS = [
  row('2026-10-18', -5230, 'Albert Heijn', 'Name: Albert Heijn 1234 Description: Pasvolgnr: 012 18-10-2026 14:32'),
  row('2026-10-16', 340000, 'Werkgever BV', 'Name: Werkgever BV Description: Salaris oktober'),
  row('2026-10-14', -1199, 'Spotify'),
  row('2026-10-02', -4350, 'NS Reizigers'),
  row('2026-09-30', -95000, 'Huur'),
  row('2026-09-12', -2480, 'Jumbo'),
];

const meta = {
  title: 'Import/ImportReview',
  component: ImportReview,
  args: {
    rows: ROWS,
    errors: [],
    duplicateHashes: [],
    rules: [],
    isSubmitting: false,
  },
  argTypes: { onConfirm: { action: 'confirm' } },
} satisfies Meta<typeof ImportReview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows are grouped by month; click a row to expand the bank description. */
export const Default: Story = {};

/** Rows already imported are dimmed, unticked and can't be selected. */
export const WithDuplicates: Story = {
  args: { duplicateHashes: ['2026-10-14-Spotify', '2026-09-30-Huur'] },
};

/** Rules decide the category shown on each row. */
export const WithRules: Story = {
  args: {
    rules: [
      { id: '1', pattern: 'albert heijn', operator: 'contains', categoryKey: 'food', matches: 0 },
      { id: '2', pattern: 'ns reizigers', operator: 'contains', categoryKey: 'transport', matches: 0 },
    ],
  },
};

export const WithErrors: Story = {
  args: {
    errors: [
      { line: 7, message: 'Invalid amount' },
      { line: 12, message: 'Invalid date' },
    ],
  },
};

export const Submitting: Story = { args: { isSubmitting: true } };
