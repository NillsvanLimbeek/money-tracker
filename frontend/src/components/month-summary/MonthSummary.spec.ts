import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MonthSummary from './MonthSummary.vue';

function mountSummary(): VueWrapper {
  return mount(MonthSummary, { props: { income: 3400, expense: 1000 } });
}

function amount(wrapper: VueWrapper, label: string): string {
  const span = wrapper.findAll('span').find(item => item.text() === label)!;
  return span.element.nextElementSibling!.textContent!.trim();
}

describe('monthSummary', () => {
  it('shows the in, out and net amounts', () => {
    const wrapper = mountSummary();

    expect(amount(wrapper, 'In')).toBe('+€3.400,00');
    expect(amount(wrapper, 'Out')).toBe('−€1.000,00');
    expect(amount(wrapper, 'Net')).toBe('+€2.400,00');
  });
});
