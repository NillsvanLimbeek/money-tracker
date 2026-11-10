import type { VueWrapper } from '@vue/test-utils';
import type { Transaction } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { usePreferences } from '@/lib/composables';
import CategoryBadge from '../category-badge/CategoryBadge.vue';
import CategoryPicker from '../category-picker/CategoryPicker.vue';
import TransactionRow from './TransactionRow.vue';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
];

const TRANSACTION: Transaction = {
  id: '1',
  date: new Date(2026, 9, 16),
  merchant: 'Albert Heijn',
  amount: -43.2,
  categoryKey: 'food',
};

const stubs = {
  Checkbox: { props: ['modelValue', 'disabled', 'size'], template: '<input type="checkbox" :checked="modelValue" :disabled="disabled" @click="$emit(\'update:modelValue\', !modelValue)" />' },
  Icon: { template: '<i />' },
};

function mountRow(props: Record<string, unknown> = {}): VueWrapper {
  return mount(TransactionRow, {
    props: { transaction: TRANSACTION, categories: CATEGORIES, pickerOpen: false, ...props },
    global: { stubs },
  });
}

describe('transactionRow', () => {
  it('shows the date, merchant, amount and category label', () => {
    const text = mountRow().text();

    expect(text).toContain('16');
    expect(text).toContain('Oct');
    expect(text).toContain('Albert Heijn');
    expect(text).toContain('−€43,20');
    expect(text).toContain('Food');
  });

  it('shows the month above the day when the date format puts the month first', () => {
    usePreferences().dateFormat.value = 'MM-dd-yyyy';
    const parts = mountRow().find('.font-mono.uppercase').findAll('p').map(item => item.text());
    usePreferences().dateFormat.value = 'dd-MM-yyyy';

    expect(parts).toEqual(['Oct', '16']);
  });

  it('drops the date and hides the badge until expanded when grouped', async () => {
    const wrapper = mountRow({ grouped: true });

    expect(wrapper.text()).not.toContain('Oct');
    expect(wrapper.findComponent(CategoryBadge).exists()).toBe(false);

    await wrapper.find('button[aria-label="Toggle details"]').trigger('click');

    expect(wrapper.findComponent(CategoryBadge).exists()).toBe(true);
  });

  it('falls back to the category key when the category is unknown', () => {
    const wrapper = mountRow({ transaction: { ...TRANSACTION, categoryKey: 'income' } });

    expect(wrapper.text()).toContain('income');
  });

  it('highlights income', () => {
    const wrapper = mountRow({ transaction: { ...TRANSACTION, amount: 3000 } });

    expect(wrapper.find('p.font-bold').classes()).toContain('text-primary');
  });

  it('expands to show the bank description from the notes', async () => {
    const wrapper = mountRow({ transaction: { ...TRANSACTION, notes: 'Name: Albert Heijn Description: Groceries' } });

    expect(wrapper.text()).not.toContain('Bank description');

    await wrapper.find('button[aria-label="Toggle details"]').trigger('click');

    expect(wrapper.text()).toContain('Bank description');
    expect(wrapper.text()).toContain('Groceries');
  });

  it('truncates the merchant until expanded', async () => {
    const wrapper = mountRow();

    expect(wrapper.find('p.font-semibold').classes()).toContain('truncate');

    await wrapper.find('p.font-semibold').trigger('click');

    expect(wrapper.find('p.font-semibold').classes()).not.toContain('truncate');
  });

  it('does not expand when the badge is clicked', async () => {
    const wrapper = mountRow();

    await wrapper.findComponent(CategoryBadge).trigger('click');

    expect(wrapper.find('p.font-semibold').classes()).toContain('truncate');
  });

  it('emits togglePicker when the badge is clicked', async () => {
    const wrapper = mountRow();

    await wrapper.findComponent(CategoryBadge).trigger('click');

    expect(wrapper.emitted('togglePicker')).toHaveLength(1);
  });

  it('only shows the picker when open', () => {
    expect(mountRow().findComponent(CategoryPicker).exists()).toBe(false);
    expect(mountRow({ pickerOpen: true }).findComponent(CategoryPicker).exists()).toBe(true);
  });

  it('emits selectCategory and closePicker from the picker', async () => {
    const wrapper = mountRow({ pickerOpen: true });
    const picker = wrapper.findComponent(CategoryPicker);

    await picker.vm.$emit('select', 'transport');
    await picker.vm.$emit('close');

    expect(wrapper.emitted('selectCategory')).toEqual([['transport']]);
    expect(wrapper.emitted('closePicker')).toHaveLength(1);
  });

  describe('selectable', () => {
    it('only shows the checkbox when selectable', () => {
      expect(mountRow().find('input').exists()).toBe(false);
      expect(mountRow({ selectable: true }).find('input').exists()).toBe(true);
    });

    it('emits toggle from the checkbox without expanding the row', async () => {
      const wrapper = mountRow({ selectable: true, selected: true });

      await wrapper.find('input').trigger('click');

      expect(wrapper.emitted('toggle')).toHaveLength(1);
      expect(wrapper.find('[aria-label="Toggle details"]').attributes('aria-expanded')).toBe('false');
    });

    it('shows a read-only category badge and never opens the picker', () => {
      const wrapper = mountRow({ selectable: true, pickerOpen: true });

      expect(wrapper.find('button[type="button"]:not([aria-label])').exists()).toBe(false);
      expect(wrapper.findComponent(CategoryPicker).exists()).toBe(false);
    });
  });

  describe('duplicate', () => {
    it('is dimmed, labelled already imported and hides the category', () => {
      const wrapper = mountRow({ selectable: true, duplicate: true });

      expect(wrapper.text()).toContain('Already imported');
      expect(wrapper.findComponent(CategoryBadge).exists()).toBe(false);
      expect(wrapper.classes()).toContain('opacity-60');
    });

    it('disables the checkbox', () => {
      const wrapper = mountRow({ selectable: true, duplicate: true });

      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });
  });
});
