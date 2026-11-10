import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Box from './Box.vue';

describe('box', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Box, { slots: { default: '<span>Net</span><span>+€2.400,00</span>' } });

    expect(wrapper.text()).toBe('Net+€2.400,00');
  });

  it('is an empty card without slot content', () => {
    const wrapper = mount(Box);

    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.text()).toBe('');
  });
});
