import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OptionDrawer from './OptionDrawer.vue';

const OPTIONS = [{ value: 'a', label: '1.234,56' }, { value: 'b', label: '1,234.56' }];

const stubs = {
  Drawer: { props: ['title'], template: '<div><h2>{{ title }}</h2><slot name="body" /></div>' },
  Icon: { template: '<i />' },
};

describe('optionDrawer', () => {
  it('lists every option under the title', () => {
    const wrapper = mount(OptionDrawer, { props: { open: true, modelValue: 'a', title: 'Number format', options: OPTIONS }, global: { stubs } });

    expect(wrapper.find('h2').text()).toBe('Number format');
    expect(wrapper.findAll('button').map(button => button.text())).toEqual(['1.234,56', '1,234.56']);
  });

  it('emits the chosen value and closes the drawer', async () => {
    const wrapper = mount(OptionDrawer, { props: { open: true, modelValue: 'a', title: 'Number format', options: OPTIONS }, global: { stubs } });

    await wrapper.findAll('button')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });
});
