import type { VueWrapper } from '@vue/test-utils';
import type { ImportRow } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImportSummary from './ImportSummary.vue';

function row(date: string, amountCents: number): ImportRow {
  return { date, description: 'Row', amountCents, rawCounterparty: null, mutationType: null, notes: null, importHash: `${date}-${amountCents}` };
}

const ROWS = [row('2026-10-16', 340000), row('2026-10-18', -5230), row('2026-10-14', -1199)];

const stubs = {
  UButton: { template: '<button><slot /></button>' },
  UIcon: { template: '<i />' },
  RouterLink: { template: '<a><slot /></a>' },
};

function mountSummary(overrides: Record<string, unknown> = {}): VueWrapper {
  return mount(ImportSummary, {
    props: { summary: { imported: 3, skipped: 2 }, rows: ROWS, fileName: 'ing_okt_2026.csv', ...overrides },
    global: { stubs },
  });
}

function stat(wrapper: VueWrapper, label: string): string {
  const term = wrapper.findAll('dt').find(item => item.text() === label)!;
  return term.element.nextElementSibling!.textContent!.trim();
}

describe('importSummary', () => {
  it('shows the count, file name and period', () => {
    const text = mountSummary().text();

    expect(text).toContain('3 transactions imported');
    expect(text).toContain('Added from ing_okt_2026.csv to October 2026.');
  });

  it('totals income and expenses and shows skipped from the response', () => {
    const wrapper = mountSummary();

    expect(stat(wrapper, 'In')).toBe('+€3.400,00');
    expect(stat(wrapper, 'Out')).toBe('−€64,29');
    expect(stat(wrapper, 'Skipped')).toBe('2');
  });

  it('counts debits as needing a category and hides the row when there are none', () => {
    expect(mountSummary().text()).toContain('2 need a category');
    expect(mountSummary({ rows: [row('2026-10-16', 1000)] }).text()).not.toContain('Uncategorised');
  });

  it('uses the singular for one transaction', () => {
    const wrapper = mountSummary({ summary: { imported: 1, skipped: 0 }, rows: [row('2026-10-18', -5230)] });

    expect(wrapper.text()).toContain('1 transaction imported');
    expect(wrapper.text()).toContain('1 needs a category');
  });

  it('emits reset from "Import another file"', async () => {
    const wrapper = mountSummary();

    await wrapper.findAll('button').find(button => button.text() === 'Import another file')!.trigger('click');

    expect(wrapper.emitted('reset')).toHaveLength(1);
  });
});
