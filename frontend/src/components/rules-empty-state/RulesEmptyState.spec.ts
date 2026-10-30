import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RulesEmptyState from './RulesEmptyState.vue';

const stubs = { Icon: { template: '<i class="icon" />' } };

describe('rulesEmptyState', () => {
  it('renders the empty message', () => {
    const wrapper = mount(RulesEmptyState, { global: { stubs } });

    expect(wrapper.text()).toContain('No rules yet');
  });

  it('emits add from the call to action', async () => {
    const wrapper = mount(RulesEmptyState, { global: { stubs } });

    await wrapper.find('button').trigger('click');

    expect(wrapper.text()).toContain('Add your first rule');
    expect(wrapper.emitted('add')).toHaveLength(1);
  });
});
