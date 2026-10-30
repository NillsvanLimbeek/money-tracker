import type { VueWrapper } from '@vue/test-utils';
import type { Transaction } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategoryBadge from '../category-badge/CategoryBadge.vue';
import CategoryPicker from '../category-picker/CategoryPicker.vue';
import TransactionList from './TransactionList.vue';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
];

const TODAY = new Date();
const TRANSACTIONS: Transaction[] = [
  { id: '1', date: TODAY, merchant: 'Albert Heijn', amount: -43.2, categoryKey: 'food' },
  { id: '2', date: TODAY, merchant: 'Salary', amount: 3000, categoryKey: 'income' },
  { id: '3', date: new Date(2026, 0, 5), merchant: 'NS', amount: -12, categoryKey: 'transport' },
];

const stubs = { UIcon: { template: '<i />' } };

function mountList(): VueWrapper {
  return mount(TransactionList, {
    props: { transactions: TRANSACTIONS, categories: CATEGORIES },
    global: { stubs, components: { CategoryBadge, CategoryPicker } },
  });
}

describe('transactionList', () => {
  it('groups transactions by day with a total', () => {
    const text = mountList().text();

    expect(text).toContain('Today · ');
    expect(text).toContain('+€2.956,80');
    expect(text).toContain('Mon 5 Jan');
  });

  it('shows the merchant, amount and category label', () => {
    const text = mountList().text();

    expect(text).toContain('Albert Heijn');
    expect(text).toContain('−€43,20');
  });

  it('shows the category badge only once a row is expanded', async () => {
    const wrapper = mountList();

    expect(wrapper.findComponent(CategoryBadge).exists()).toBe(false);

    await wrapper.find('button[aria-label="Toggle details"]').trigger('click');

    expect(wrapper.findComponent(CategoryBadge).text()).toBe('Food');
  });

  it('falls back to the category key when the category is unknown', async () => {
    const wrapper = mountList();

    await wrapper.findAll('button[aria-label="Toggle details"]')[1]!.trigger('click');

    expect(wrapper.text()).toContain('income');
  });

  it('opens the picker for one row at a time', async () => {
    const wrapper = mountList();

    for (const toggle of wrapper.findAll('button[aria-label="Toggle details"]'))
      await toggle.trigger('click');

    const badges = wrapper.findAllComponents(CategoryBadge);

    await badges[0]!.trigger('click');
    expect(wrapper.findAllComponents(CategoryPicker)).toHaveLength(1);

    await badges[1]!.trigger('click');
    expect(wrapper.findAllComponents(CategoryPicker)).toHaveLength(1);

    await badges[1]!.trigger('click');
    expect(wrapper.findComponent(CategoryPicker).exists()).toBe(false);
  });

  it('emits changeCategory and closes the picker on select', async () => {
    const wrapper = mountList();

    await wrapper.find('button[aria-label="Toggle details"]').trigger('click');
    await wrapper.findComponent(CategoryBadge).trigger('click');
    await wrapper.findComponent(CategoryPicker).vm.$emit('select', 'transport');

    expect(wrapper.emitted('changeCategory')).toEqual([[{ id: '1', categoryKey: 'transport' }]]);
    expect(wrapper.findComponent(CategoryPicker).exists()).toBe(false);
  });
});
