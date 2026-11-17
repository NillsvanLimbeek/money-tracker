import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DeltaChip from './DeltaChip.vue';

function mountChip(props: { label?: string; delta: number; upIsGood?: boolean }): VueWrapper {
  return mount(DeltaChip, { props: { label: 'vs Sep', ...props } });
}

describe('deltaChip', () => {
  it('shows the label', () => {
    expect(mountChip({ delta: 5, label: '+5% vs Sep' }).text()).toBe('+5% vs Sep');
  });

  it.each([
    [5, 'i-lucide-arrow-up'],
    [-5, 'i-lucide-arrow-down'],
    [0, 'i-lucide-minus'],
  ])('shows the right arrow for a delta of %d', (delta, icon) => {
    expect(mountChip({ delta }).findComponent({ name: 'Icon' }).props('name')).toBe(icon);
  });

  it.each([
    ['an increase when up is good', 5, true, 'text-success'],
    ['a decrease when up is good', -5, true, 'text-error'],
    ['an increase when up is bad', 5, false, 'text-error'],
    ['a decrease when up is bad', -5, false, 'text-success'],
  ])('is coloured for %s', (_name, delta, upIsGood, tone) => {
    expect(mountChip({ delta, upIsGood }).classes()).toContain(tone);
  });

  it('treats an increase as good news by default', () => {
    expect(mountChip({ delta: 5 }).classes()).toContain('text-success');
  });

  it('is neutral when nothing changed, whichever way is good', () => {
    expect(mountChip({ delta: 0, upIsGood: true }).classes()).toContain('text-muted');
    expect(mountChip({ delta: 0, upIsGood: false }).classes()).toContain('text-muted');
  });
});
