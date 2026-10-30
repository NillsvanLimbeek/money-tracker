import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SettingsRow from './SettingsRow.vue';

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } };

describe('settingsRow', () => {
  it('renders the label and description', () => {
    const wrapper = mount(SettingsRow, { props: { label: 'ING', description: '··48 21' }, global: { stubs } });

    expect(wrapper.text()).toContain('ING');
    expect(wrapper.text()).toContain('··48 21');
  });

  it('renders a link with a chevron when `to` is set', () => {
    const wrapper = mount(SettingsRow, { props: { label: 'Rules', to: '/rules' }, global: { stubs } });

    expect(wrapper.find('a').attributes('href')).toBe('/rules');
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('renders a primary button and emits click for an action row', async () => {
    let clicks = 0;
    const wrapper = mount(SettingsRow, { props: { label: 'Add account', action: true }, attrs: { onClick: () => clicks++ }, global: { stubs } });

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.find('span span').classes()).toContain('text-primary');

    await wrapper.trigger('click');

    expect(clicks).toBe(1);
  });

  it('prefers the trailing slot over the chevron', () => {
    const wrapper = mount(SettingsRow, {
      props: { label: 'Rules', to: '/rules' },
      slots: { trailing: '<span class="count">14</span>' },
      global: { stubs },
    });

    expect(wrapper.find('.count').text()).toBe('14');
    expect(wrapper.find('svg').exists()).toBe(false);
  });
});
