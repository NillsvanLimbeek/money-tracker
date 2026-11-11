import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Stepper from './Stepper.vue';

describe('stepper', () => {
  it('renders one segment per step', () => {
    expect(mount(Stepper, { props: { stepCount: 3, step: 1 } }).findAll('span')).toHaveLength(3);
  });

  it('fills the segments up to the current step', () => {
    const segments = mount(Stepper, { props: { stepCount: 3, step: 2 } }).findAll('span');

    expect(segments.map(segment => segment.classes('bg-primary'))).toEqual([true, true, false]);
    expect(segments.map(segment => segment.classes('bg-accented'))).toEqual([false, false, true]);
  });
});
