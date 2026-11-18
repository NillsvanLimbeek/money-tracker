import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MonthPicker from './MonthPicker.vue';

const stubs = {
  UButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
};

function mountPicker(modelValue = new Date(2026, 9, 1)): VueWrapper {
  return mount(MonthPicker, { props: { modelValue }, global: { stubs } });
}

describe('monthPicker', () => {
  it('shows the selected month', () => {
    expect(mountPicker().text()).toContain('October 2026');
  });

  it.each([
    ['Previous month', 8],
    ['Next month', 10],
  ])('emits the shifted date from "%s"', async (label, month) => {
    const wrapper = mountPicker();

    await wrapper.find(`[aria-label="${label}"]`).trigger('click');

    expect((wrapper.emitted('update:modelValue')![0]![0] as Date).getMonth()).toBe(month);
  });

  it('asks to open the month sheet from the label', async () => {
    const wrapper = mountPicker();

    await wrapper.find('[aria-label^="Choose month"]').trigger('click');

    expect(wrapper.emitted('open')).toHaveLength(1);
  });
});
