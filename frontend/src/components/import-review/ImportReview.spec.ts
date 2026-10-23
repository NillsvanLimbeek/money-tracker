import type { VueWrapper } from '@vue/test-utils';
import type { ImportRow } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImportReview from './ImportReview.vue';

function row(date: string, amountCents: number, description: string): ImportRow {
  return { date, description, amountCents, rawCounterparty: null, mutationType: null, importHash: `${date}-${description}` };
}

const ROWS = [
  row('2026-10-18', -5230, 'Albert Heijn'),
  row('2026-10-16', 340000, 'Werkgever'),
  row('2026-10-14', -1199, 'Spotify'),
  row('2026-09-30', -9500, 'Huur'),
];

const stubs = {
  UButton: { template: '<button><slot /></button>' },
  UAlert: { template: '<div><slot name="description" /></div>' },
  UIcon: { template: '<i />' },
};

function mountReview(overrides: Record<string, unknown> = {}): VueWrapper {
  return mount(ImportReview, {
    props: { rows: ROWS, errors: [], duplicateHashes: ['2026-10-14-Spotify'], isSubmitting: false, ...overrides },
    global: { stubs },
  });
}

function stat(wrapper: VueWrapper, label: string): string {
  const term = wrapper.findAll('dt').find(item => item.text() === label)!;
  return term.element.nextElementSibling!.textContent!.trim();
}

describe('importReview', () => {
  it('starts with duplicates unticked and counts found, selected and duplicates', () => {
    const wrapper = mountReview();

    expect(stat(wrapper, 'Found')).toBe('4');
    expect(stat(wrapper, 'Selected')).toBe('3');
    expect(stat(wrapper, 'Duplicates')).toBe('1');
    expect(wrapper.find('[aria-label="Spotify"]').attributes('aria-checked')).toBe('false');
    expect(wrapper.find('[aria-label="Spotify"]').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Already imported');
  });

  it('groups rows under month headings', () => {
    const wrapper = mountReview();

    expect(wrapper.findAll('h3').map(heading => heading.text())).toEqual(['October 2026', 'September 2026']);
  });

  it('shows the selected count and in/out totals in the footer', () => {
    const wrapper = mountReview();

    expect(wrapper.text()).toContain('Import 3 transactions');
    expect(wrapper.text()).toContain('+€3.400,00 in');
    expect(wrapper.text()).toContain('−€147,30 out');
  });

  it('updates the counts and totals when a row is unticked', async () => {
    const wrapper = mountReview();

    await wrapper.find('[aria-label="Huur"]').trigger('click');

    expect(stat(wrapper, 'Selected')).toBe('2');
    expect(wrapper.text()).toContain('Import 2 transactions');
    expect(wrapper.text()).toContain('−€52,30 out');
  });

  it('ignores clicks on duplicates', async () => {
    const wrapper = mountReview();

    await wrapper.find('[aria-label="Spotify"]').trigger('click');

    expect(stat(wrapper, 'Selected')).toBe('3');
  });

  it('toggles a month between select all and deselect all, skipping duplicates', async () => {
    const wrapper = mountReview();
    const october = wrapper.findAll('section')[0]!;
    const toggle = october.find('button:not([role="checkbox"])');

    expect(toggle.text()).toBe('Deselect all');
    await toggle.trigger('click');
    expect(stat(wrapper, 'Selected')).toBe('1');
    expect(toggle.text()).toBe('Select all');

    await toggle.trigger('click');
    expect(stat(wrapper, 'Selected')).toBe('3');
  });

  it('emits only the selected rows on confirm', async () => {
    const wrapper = mountReview();

    await wrapper.find('[aria-label="Huur"]').trigger('click');
    const confirm = wrapper.findAll('button').find(button => button.text().startsWith('Import'))!;
    await confirm.trigger('click');

    const [rows] = wrapper.emitted('confirm')![0] as [ImportRow[]];
    expect(rows.map(item => item.description)).toEqual(['Albert Heijn', 'Werkgever']);
  });

  it('lists rows that could not be read', () => {
    const wrapper = mountReview({ errors: [{ line: 7, message: 'Invalid amount "abc"' }] });

    expect(wrapper.text()).toContain('Line 7: Invalid amount "abc"');
  });
});
