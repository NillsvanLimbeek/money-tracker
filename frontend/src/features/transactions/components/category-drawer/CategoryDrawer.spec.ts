import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategoryDrawer from './CategoryDrawer.vue';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
];

const stubs = {
  Drawer: { template: '<div><slot /><slot name="actions" /><slot name="header" /><slot name="body" /><slot name="footer" /></div>' },
  Button: { template: '<button><slot /></button>' },
};

function mountDrawer(): VueWrapper {
  return mount(CategoryDrawer, {
    props: { categories: CATEGORIES, selectedCategories: ['food'], open: true },
    global: { stubs },
  });
}

describe('categoryDrawer', () => {
  it('renders a button per category', () => {
    const labels = mountDrawer().findAll('button').map(button => button.text());

    expect(labels).toContain('Food');
    expect(labels).toContain('Transport');
  });

  it('emits toggleCategory with the category key', async () => {
    const wrapper = mountDrawer();

    await wrapper.findAll('button').find(button => button.text() === 'Transport')!.trigger('click');

    expect(wrapper.emitted('toggleCategory')).toEqual([['transport']]);
  });

  it('emits resetCategories from Reset', async () => {
    const wrapper = mountDrawer();

    await wrapper.findAll('button').find(button => button.text() === 'Reset')!.trigger('click');

    expect(wrapper.emitted('resetCategories')).toHaveLength(1);
  });

  it('closes the drawer from "Show items"', async () => {
    const wrapper = mountDrawer();

    await wrapper.findAll('button').find(button => button.text() === 'Show items')!.trigger('click');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('fills selected categories with the category colour', () => {
    const buttons = mountDrawer().findAll('button');
    const food = buttons.find(button => button.text() === 'Food')!;
    const transport = buttons.find(button => button.text() === 'Transport')!;

    expect(food.attributes('style')).toContain('var(--ui-text-inverted)');
    expect(transport.attributes('style')).not.toContain('var(--ui-text-inverted)');
  });
});
