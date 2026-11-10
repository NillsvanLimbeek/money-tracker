import type { VueWrapper } from '@vue/test-utils';
import type { Transaction } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SearchFilterSelection from './SearchFilterSelection.vue';

const stubs = {
  UButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
};

const FOOD = { key: 'food', label: 'Food' };
const TRANSPORT = { key: 'transport', label: 'Transport' };

function transaction(id: string, categoryKey: string): Transaction {
  return { id, date: new Date(2026, 9, 1), merchant: 'Shop', amount: -10, categoryKey };
}

const ALL = [transaction('1', 'food'), transaction('2', 'food'), transaction('3', 'transport'), transaction('4', 'other')];

function mountSelection(props: Record<string, unknown> = {}): VueWrapper {
  return mount(SearchFilterSelection, {
    props: {
      selectedCategories: ['food'],
      selectedCategoryItems: [FOOD],
      transactions: ALL,
      filteredTransactions: ALL.slice(0, 2),
      ...props,
    },
    global: { stubs },
  });
}

describe('searchFilterSelection', () => {
  it('renders nothing while no category is selected', () => {
    const wrapper = mountSelection({ selectedCategories: [], selectedCategoryItems: [] });

    expect(wrapper.text()).toBe('');
  });

  it('shows how many transactions match out of the total, and in which category', () => {
    const wrapper = mountSelection();

    expect(wrapper.text()).toContain('2 of 4');
    expect(wrapper.text()).toContain('in Food');
  });

  it('lists every selected category with a dot each', () => {
    const wrapper = mountSelection({ selectedCategories: ['food', 'transport'], selectedCategoryItems: [FOOD, TRANSPORT] });

    expect(wrapper.text()).toContain('in Food, Transport');
    expect(wrapper.findAll('.size-2')).toHaveLength(2);
  });

  it('emits clear from the Clear button', async () => {
    const wrapper = mountSelection();

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('clear')).toHaveLength(1);
  });
});
