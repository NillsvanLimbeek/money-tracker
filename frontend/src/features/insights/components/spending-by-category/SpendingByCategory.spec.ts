import type { VueWrapper } from '@vue/test-utils';
import type { Transaction } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategoryDonut from '../category-donut/CategoryDonut.vue';
import CategorySpendRow from '../category-spend-row/CategorySpendRow.vue';
import SpendingByCategory from './SpendingByCategory.vue';

function transaction(categoryKey: string, amount: number): Transaction {
  return { id: `${categoryKey}-${amount}`, date: new Date(2026, 10, 1), merchant: 'Shop', amount, categoryKey };
}

// The canvas is not available in jsdom, so the donut is replaced by a stub that still renders its centre slot.
function mountCard(transactions: Transaction[], previousTransactions: Transaction[] = []): VueWrapper {
  return mount(SpendingByCategory, {
    props: { month: new Date(2026, 9, 1), transactions, previousTransactions },
    global: { stubs: { CategoryDonut: { template: '<div><slot /></div>' } } },
  });
}

describe('spendingByCategory', () => {
  it('shows an empty message when nothing was spent', () => {
    const wrapper = mountCard([transaction('income', 1000)]);

    expect(wrapper.text()).toContain('No spending this month yet.');
    expect(wrapper.findAllComponents(CategorySpendRow)).toHaveLength(0);
  });

  it('shows the total spent and a row per category, biggest first', () => {
    const wrapper = mountCard([transaction('food', -40), transaction('housing', -60), transaction('income', 500)]);

    expect(wrapper.text()).toContain('Spent in October');
    expect(wrapper.text()).toContain('€100,00');
    expect(wrapper.findAllComponents(CategorySpendRow).map(row => row.props('spend').categoryKey)).toEqual(['housing', 'food']);
  });

  it('names the biggest category and the category that changed most', () => {
    const wrapper = mountCard(
      [transaction('housing', -100), transaction('shopping', -150)],
      [transaction('housing', -100), transaction('shopping', -100)],
    );

    expect(wrapper.text()).toMatch(/Biggest\s*:\s*Shopping\s*60%/);
    expect(wrapper.text()).toMatch(/Biggest change\s*:\s*Shopping\s*\+50%/);
  });

  it('leaves out the biggest change when no category changed', () => {
    const wrapper = mountCard([transaction('food', -10)], [transaction('food', -10)]);

    expect(wrapper.text()).not.toContain('Biggest change');
  });

  it('dims the other rows when a segment is selected, and clears it on a second tap', async () => {
    const wrapper = mountCard([transaction('housing', -60), transaction('food', -40)]);
    const donut = wrapper.findComponent(CategoryDonut);

    donut.vm.$emit('select', 'housing');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(CategorySpendRow).map(row => row.props('dimmed'))).toEqual([false, true]);

    donut.vm.$emit('select', 'housing');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(CategorySpendRow).map(row => row.props('dimmed'))).toEqual([false, false]);
  });
});
