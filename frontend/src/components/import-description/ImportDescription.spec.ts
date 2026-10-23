import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImportDescription from './ImportDescription.vue';

describe('importDescription', () => {
  it('renders the title and subtitle', () => {
    const wrapper = mount(ImportDescription, { props: { title: 'Pick a file', subtitle: 'Export it from ING first.' } });

    expect(wrapper.find('h2').text()).toBe('Pick a file');
    expect(wrapper.find('p').text()).toBe('Export it from ING first.');
  });
});
