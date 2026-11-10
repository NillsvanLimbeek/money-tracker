import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SegmentedControl from './SegmentedControl.vue';

const OPTIONS = [{ value: 'en', label: 'EN' }, { value: 'nl', label: 'NL' }];

describe('segmentedControl', () => {
  it('marks the selected option', () => {
    const wrapper = mount(SegmentedControl, { props: { modelValue: 'nl', options: OPTIONS } });

    const checked = wrapper.findAll('button').map(button => button.attributes('aria-checked'));
    expect(checked).toEqual(['false', 'true']);
  });

  it('emits update:modelValue when another option is clicked', async () => {
    const wrapper = mount(SegmentedControl, { props: { modelValue: 'en', options: OPTIONS } });

    await wrapper.findAll('button')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['nl']]);
  });
});
