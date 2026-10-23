import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PageHeader from './PageHeader.vue';

describe('pageHeader', () => {
  it('renders the title', () => {
    expect(mount(PageHeader, { props: { title: 'Ledger' } }).find('h1').text()).toBe('Ledger');
  });

  it('renders the left and right slots', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Ledger' },
      slots: { left: '<span>Back</span>', right: '<span>Filter</span>' },
    });

    expect(wrapper.text()).toContain('Back');
    expect(wrapper.text()).toContain('Filter');
  });
});
