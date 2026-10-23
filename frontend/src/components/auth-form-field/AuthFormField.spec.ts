import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AuthFormField from './AuthFormField.vue';

const stubs = {
  UFormField: { template: '<div><slot /></div>' },
  UInput: { props: ['modelValue', 'type'], template: '<input :type="type" :value="modelValue" /><slot name="trailing" />' },
  UCheckbox: { props: ['modelValue', 'label'], template: '<label>{{ label }}</label>' },
  UProgress: { template: '<div class="progress" />' },
};

function mountField(field: Record<string, unknown>, modelValue: string | boolean = ''): VueWrapper {
  return mount(AuthFormField, { props: { field: { name: 'password', type: 'password', ...field } as never, modelValue }, global: { stubs } });
}

describe('authFormField', () => {
  it('renders a checkbox with its label', () => {
    const wrapper = mountField({ type: 'checkbox', label: 'Remember me' }, false);

    expect(wrapper.text()).toContain('Remember me');
  });

  it('toggles password visibility', async () => {
    const wrapper = mountField({ type: 'password' }, 'secret');

    expect(wrapper.find('input').attributes('type')).toBe('password');

    await wrapper.find('button').trigger('click');

    expect(wrapper.find('input').attributes('type')).toBe('text');
    expect(wrapper.find('button').text()).toBe('Hide');
  });

  it.each([
    ['abc', 'Weak'],
    ['abcdefg1', 'Okay'],
    ['abcdefghij1!', 'Strong'],
  ])('rates "%s" as %s when strength is shown', (value, label) => {
    expect(mountField({ showStrength: true }, value).text()).toContain(label);
  });

  it('hides the strength meter for an empty value or when disabled', () => {
    expect(mountField({ showStrength: true }, '').find('.progress').exists()).toBe(false);
    expect(mountField({ showStrength: false }, 'abcdefg1').find('.progress').exists()).toBe(false);
  });
});
