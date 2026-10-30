import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategorySelect from './CategorySelect.vue';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'housing', label: 'Housing' },
];

const stubs = { Icon: { template: '<i class="icon" />' } };

function mountSelect(modelValue: string | null = null): VueWrapper {
  return mount(CategorySelect, { props: { categories: CATEGORIES, modelValue }, global: { stubs } });
}

describe('categorySelect', () => {
  it('renders a button per category', () => {
    expect(mountSelect().findAll('button').map(button => button.text())).toEqual(['Food', 'Housing']);
  });

  it('emits the chosen category key', async () => {
    const wrapper = mountSelect();

    await wrapper.findAll('button')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['housing']]);
  });

  it('marks only the selected category as pressed', () => {
    const [food, housing] = mountSelect('food').findAll('button');

    expect(food!.attributes('aria-pressed')).toBe('true');
    expect(housing!.attributes('aria-pressed')).toBe('false');
  });
});
