import type { DOMWrapper, VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MonthPickerDrawer from './MonthPickerDrawer.vue';

const stubs = {
  Drawer: { template: '<div><slot name="body" /></div>' },
  UButton: { template: '<button @click="$emit(\'click\')" />' },
};

function mountDrawer(): VueWrapper {
  return mount(MonthPickerDrawer, {
    props: {
      open: true,
      modelValue: new Date(2026, 9, 1),
      importedMonths: ['2026-09', '2026-10'],
      today: new Date(2026, 10, 10),
    },
    global: { stubs },
  });
}

function monthButtons(wrapper: VueWrapper): DOMWrapper<Element>[] {
  return wrapper.findAll('button').filter(button => button.attributes('aria-pressed') !== undefined);
}

describe('monthPickerDrawer', () => {
  it('lists the twelve months of the selected year', () => {
    const wrapper = mountDrawer();

    expect(wrapper.text()).toContain('2026');
    expect(monthButtons(wrapper).map(button => button.text())).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });

  it('marks the selected month, the imported months and disables future months', () => {
    const buttons = monthButtons(mountDrawer());

    expect(buttons[9]!.attributes('aria-pressed')).toBe('true');
    expect(buttons[8]!.find('[data-imported]').attributes('data-imported')).toBe('true');
    expect(buttons[7]!.find('[data-imported]').attributes('data-imported')).toBe('false');
    expect(buttons[10]!.attributes('disabled')).toBeUndefined();
    expect(buttons[11]!.attributes('disabled')).toBeDefined();
  });

  it('selects a month and closes the sheet', async () => {
    const wrapper = mountDrawer();

    await monthButtons(wrapper)[8]!.trigger('click');

    expect((wrapper.emitted('update:modelValue')![0]![0] as Date).getMonth()).toBe(8);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('moves between years but not past the current one', async () => {
    const wrapper = mountDrawer();

    await wrapper.find('[aria-label="Previous year"]').trigger('click');
    expect(wrapper.text()).toContain('2025');
    expect(monthButtons(wrapper).every(button => button.attributes('disabled') === undefined)).toBe(true);

    await wrapper.find('[aria-label="Next year"]').trigger('click');
    expect(wrapper.find('[aria-label="Next year"]').attributes('disabled')).toBeDefined();
  });
});
