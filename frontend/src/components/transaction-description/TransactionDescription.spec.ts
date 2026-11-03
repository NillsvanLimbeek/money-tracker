import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TransactionDescription from './TransactionDescription.vue';

describe('transactionDescription', () => {
  it('renders the heading', () => {
    const wrapper = mount(TransactionDescription, { props: { noteLines: [] } });

    expect(wrapper.text()).toContain('Bank description');
  });

  it('renders a paragraph per note line', () => {
    const wrapper = mount(TransactionDescription, { props: { noteLines: ['Albert Heijn 1234', 'Pas 567'] } });
    const paragraphs = wrapper.findAll('p');

    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[1]!.text()).toBe('Albert Heijn 1234');
    expect(paragraphs[2]!.text()).toBe('Pas 567');
  });
});
