import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Chip from './Chip.vue';

const CHIP = { key: 'food', label: 'Food', count: 7 };

function mountChip(selected: string | null = null): VueWrapper {
  return mount(Chip, { props: { chip: CHIP, selected } });
}

describe('chip', () => {
  it('renders the label and count', () => {
    const text = mountChip().text();

    expect(text).toContain('Food');
    expect(text).toContain('7');
  });

  it('emits select with the chip key on click', async () => {
    const wrapper = mountChip();

    await wrapper.trigger('click');

    expect(wrapper.emitted('select')).toEqual([['food']]);
  });

  it('highlights itself when selected', () => {
    expect(mountChip('food').classes()).toContain('text-primary');
  });

  it('is not highlighted when another chip is selected', () => {
    const classes = mountChip('housing').classes();

    expect(classes).not.toContain('text-primary');
    expect(classes).toContain('text-highlighted');
  });
});
