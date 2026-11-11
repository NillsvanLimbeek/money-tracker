import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SettingsSection from './SettingsSection.vue';

describe('settingsSection', () => {
  it('renders the title and slotted rows', () => {
    const wrapper = mount(SettingsSection, {
      props: { title: 'Accounts' },
      slots: { default: '<div class="row">One</div>' },
    });

    expect(wrapper.find('h2').text()).toBe('Accounts');
    expect(wrapper.find('.row').text()).toBe('One');
  });
});
