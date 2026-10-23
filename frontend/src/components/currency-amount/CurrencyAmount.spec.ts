import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CurrencyAmount from './CurrencyAmount.vue';

describe('currencyAmount', () => {
  it('shows the label and the formatted value', () => {
    const wrapper = mountAmount({ label: 'In', value: 1234.5 });

    expect(wrapper.text()).toContain('In');
    expect(wrapper.text()).toContain('+€1.234,50');
  });

  it('formats negative values with a minus sign', () => {
    expect(mountAmount({ label: 'Out', value: -5 }).text()).toContain('−€5,00');
  });

  it('applies attrs to the value, not the wrapper', () => {
    const wrapper = mount(CurrencyAmount, { props: { label: 'Net', value: 1 }, attrs: { class: 'text-lg' } });

    expect(wrapper.classes()).not.toContain('text-lg');
    expect(wrapper.findAll('span')[1]!.classes()).toContain('text-lg');
  });

  it('aligns to the end when requested', () => {
    expect(mountAmount({ label: 'Net', value: 1, align: 'end' }).classes()).toContain('items-end');
    expect(mountAmount({ label: 'Net', value: 1 }).classes()).toContain('items-start');
  });
});

function mountAmount(props: Record<string, unknown>): VueWrapper {
  return mount(CurrencyAmount, { props: props as never });
}
