import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatStrip from './StatStrip.vue';

describe('statStrip', () => {
  it('renders a label and value per stat', () => {
    const wrapper = mount(StatStrip, { props: { stats: [{ label: 'In', value: '€10' }, { label: 'Skipped', value: 2 }] } });

    expect(wrapper.findAll('dt').map(item => item.text())).toEqual(['In', 'Skipped']);
    expect(wrapper.findAll('dd').map(item => item.text())).toEqual(['€10', '2']);
  });

  it('applies a custom value class and otherwise the default', () => {
    const wrapper = mount(StatStrip, { props: { stats: [{ label: 'In', value: 1, valueClass: 'text-primary' }, { label: 'Out', value: 2 }] } });
    const [first, second] = wrapper.findAll('dd');

    expect(first!.classes()).toContain('text-primary');
    expect(second!.classes()).toContain('text-highlighted');
  });
});
