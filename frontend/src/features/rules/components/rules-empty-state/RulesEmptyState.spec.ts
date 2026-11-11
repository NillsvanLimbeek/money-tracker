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

    await wrapper.findAll('button')[0]!.trigger('click');

    expect(wrapper.text()).toContain('Add your first rule');
    expect(wrapper.emitted('add')).toHaveLength(1);
  });

  it('emits suggest from the suggested rules button', async () => {
    const wrapper = mount(RulesEmptyState, { global: { stubs } });

    await wrapper.findAll('button')[1]!.trigger('click');

    expect(wrapper.text()).toContain('Add suggested rules');
    expect(wrapper.emitted('suggest')).toHaveLength(1);
    expect(wrapper.emitted('add')).toBeUndefined();
  });
});
