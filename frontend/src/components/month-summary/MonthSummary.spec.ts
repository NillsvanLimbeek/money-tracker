import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MonthSummary from './MonthSummary.vue';

const stubs = {
  UButton: { template: '<button @click="$emit(\'click\')" />' },
};

function mountSummary(modelValue = new Date(2026, 9, 15)): VueWrapper {
  return mount(MonthSummary, { props: { income: 3400, expense: 1000, modelValue }, global: { stubs } });
}

function amount(wrapper: VueWrapper, label: string): string {
  const span = wrapper.findAll('span').find(item => item.text() === label)!;
  return span.element.nextElementSibling!.textContent!.trim();
}

describe('monthSummary', () => {
  it('shows the month and the in, out and net amounts', () => {
    const wrapper = mountSummary();

    expect(wrapper.text()).toContain('October 2026');
    expect(amount(wrapper, 'In')).toBe('+€3.400,00');
    expect(amount(wrapper, 'Out')).toBe('−€1.000,00');
    expect(amount(wrapper, 'Net')).toBe('+€2.400,00');
  });

  it.each([
    ['Previous month', 8],
    ['Next month', 10],
  ])('emits the shifted date from "%s"', async (label, month) => {
    const wrapper = mountSummary();

    await wrapper.find(`[aria-label="${label}"]`).trigger('click');

    expect((wrapper.emitted('update:modelValue')![0]![0] as Date).getMonth()).toBe(month);
  });
});
