import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppDrawer from './AppDrawer.vue';

const stubs = {
  Drawer: { template: '<div><slot name="header" /><slot name="body" /><slot name="footer" /></div>' },
  Icon: { template: '<i />' },
};

function mountDrawer(slots = {}): VueWrapper {
  return mount(AppDrawer, { props: { open: true, title: 'New rule' }, slots, global: { stubs } });
}

describe('appDrawer', () => {
  it('renders the title and the default slot as the body', () => {
    const wrapper = mountDrawer({ default: '<p>Body</p>' });

    expect(wrapper.find('h2').text()).toBe('New rule');
    expect(wrapper.text()).toContain('Body');
  });

  it('renders the footer slot when given', () => {
    expect(mountDrawer({ footer: '<span>Actions</span>' }).text()).toContain('Actions');
  });

  it('closes from the close button', async () => {
    const wrapper = mountDrawer();

    await wrapper.find('button[aria-label="Close"]').trigger('click');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });
});
