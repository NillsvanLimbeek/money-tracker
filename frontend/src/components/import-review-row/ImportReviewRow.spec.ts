import type { VueWrapper } from '@vue/test-utils';
import type { ImportRow } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImportReviewRow from './ImportReviewRow.vue';

const ROW: ImportRow = {
  date: '2026-10-16',
  description: 'Albert Heijn',
  amountCents: -4320,
  rawCounterparty: null,
  mutationType: null,
  notes: 'Name: Albert Heijn Description: Groceries',
  importHash: 'hash',
};

const stubs = {
  Checkbox: { props: ['modelValue', 'disabled', 'size'], template: '<input type="checkbox" :checked="modelValue" :disabled="disabled" @click="$emit(\'update:modelValue\', !modelValue)" />' },
  Icon: { template: '<i />' },
};

function mountRow(props: Record<string, unknown> = {}): VueWrapper {
  return mount(ImportReviewRow, { props: { row: ROW, selected: true, duplicate: false, ...props }, global: { stubs } });
}

describe('importReviewRow', () => {
  it('shows the date, description and amount', () => {
    const text = mountRow().text();

    expect(text).toContain('16');
    expect(text).toContain('Oct');
    expect(text).toContain('Albert Heijn');
    expect(text).toContain('−€43,20');
  });

  it('assigns the placeholder category from the amount sign', () => {
    expect(mountRow().text()).toContain('Other');
    expect(mountRow({ row: { ...ROW, amountCents: 1000 } }).text()).toContain('Income');
  });

  it('emits toggle from the checkbox without expanding the row', async () => {
    const wrapper = mountRow();

    await wrapper.find('input').trigger('click');

    expect(wrapper.emitted('toggle')).toHaveLength(1);
    expect(wrapper.find('[aria-label="Toggle details"]').attributes('aria-expanded')).toBe('false');
  });

  it('expands to show the bank description when clicked', async () => {
    const wrapper = mountRow();

    expect(wrapper.text()).not.toContain('Bank description');

    await wrapper.trigger('click');

    expect(wrapper.text()).toContain('Bank description');
    expect(wrapper.find('[aria-label="Toggle details"]').attributes('aria-expanded')).toBe('true');
  });

  it('does not show a notes panel for a row without notes', async () => {
    const wrapper = mountRow({ row: { ...ROW, notes: null } });

    await wrapper.trigger('click');

    expect(wrapper.text()).not.toContain('Bank description');
  });

  it('marks duplicates as already imported and disables the checkbox', () => {
    const wrapper = mountRow({ duplicate: true });

    expect(wrapper.text()).toContain('Already imported');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('opacity-60');
  });
});
