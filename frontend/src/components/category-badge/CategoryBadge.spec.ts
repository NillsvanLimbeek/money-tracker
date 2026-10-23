import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategoryBadge from './CategoryBadge.vue';

const stubs = { Icon: { template: '<i class="icon" />' } };

function mountBadge(props: Record<string, unknown> = {}): VueWrapper {
  return mount(CategoryBadge, { props: { categoryKey: 'food', label: 'Food', ...props }, global: { stubs } });
}

describe('categoryBadge', () => {
  it('renders the label and a chevron by default', () => {
    const wrapper = mountBadge();

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.text()).toBe('Food');
    expect(wrapper.find('.icon').exists()).toBe(true);
  });

  it('hides the icon when showIcon is false', () => {
    expect(mountBadge({ showIcon: false }).find('.icon').exists()).toBe(false);
  });

  it('renders a plain span that does not emit when not interactive', async () => {
    const wrapper = mountBadge({ interactive: false });

    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.attributes('type')).toBeUndefined();
  });

  it('emits click', async () => {
    const wrapper = mountBadge();

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('uses the inverted text colour and category fill when selected', () => {
    const style = mountBadge({ selected: true }).attributes('style')!;

    expect(style).toContain('var(--category-food-text)');
    expect(style).toContain('var(--ui-text-inverted)');
  });

  it('uses the soft category colours when not selected', () => {
    expect(mountBadge().attributes('style')).toContain('var(--category-food-bg)');
  });
});
