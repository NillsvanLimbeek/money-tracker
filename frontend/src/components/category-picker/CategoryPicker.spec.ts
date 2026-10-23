import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategoryBadge from '../category-badge/CategoryBadge.vue';
import CategoryPicker from './CategoryPicker.vue';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
];

const stubs = { UIcon: { template: '<i />' } };

function mountPicker(): VueWrapper {
  return mount(CategoryPicker, {
    props: { categories: CATEGORIES, selectedKey: 'food' },
    global: { stubs, components: { CategoryBadge } },
  });
}

describe('categoryPicker', () => {
  it('renders a badge per category and marks the selected one', () => {
    const badges = mountPicker().findAllComponents(CategoryBadge);

    expect(badges.map(badge => badge.props('label'))).toEqual(['Food', 'Transport']);
    expect(badges.map(badge => badge.props('selected'))).toEqual([true, false]);
  });

  it('emits select with the clicked category key', async () => {
    const wrapper = mountPicker();

    await wrapper.findAllComponents(CategoryBadge)[1]!.trigger('click');

    expect(wrapper.emitted('select')).toEqual([['transport']]);
  });

  it('emits close from the close button', async () => {
    const wrapper = mountPicker();

    await wrapper.find('[aria-label="Close"]').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
