import type { VueWrapper } from '@vue/test-utils';
import type { CategoryRule, RuleOperator, RulePreview } from '@/lib/types';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RuleForm from './RuleForm.vue';

const CATEGORIES = [
  { key: 'housing', label: 'Housing' },
  { key: 'food', label: 'Food' },
];
const RULES: CategoryRule[] = [{ id: 'r1', pattern: 'Ziggo', operator: 'contains', categoryKey: 'housing', matches: 2 }];
const PREVIEW: RulePreview = {
  count: 3,
  descriptions: [{ description: 'AH to go', count: 3, date: '2026-10-23', amountCents: -685 }],
};

const stubs = {
  Drawer: { template: '<div><slot /><slot name="header" /><slot name="body" /><slot name="footer" /></div>' },
  Icon: { template: '<i />' },
};

interface Draft { pattern?: string; operator?: RuleOperator; categoryKey?: string | null; preview?: RulePreview }

function mountForm({ pattern = '', operator = 'contains', categoryKey = null, preview }: Draft = {}): VueWrapper {
  return mount(RuleForm, {
    props: { open: true, operator, pattern, categoryKey, categories: CATEGORIES, rules: RULES, preview },
    global: { stubs },
  });
}

const button = (wrapper: VueWrapper, label: string): ReturnType<VueWrapper['find']> => wrapper.findAll('button').find(item => item.text() === label)!;

describe('ruleForm', () => {
  it('renders a button per category', () => {
    const wrapper = mountForm();

    expect(button(wrapper, 'Housing').exists()).toBe(true);
    expect(button(wrapper, 'Food').exists()).toBe(true);
  });

  it('emits the chosen category key', async () => {
    const wrapper = mountForm();

    await button(wrapper, 'Food').trigger('click');

    expect(wrapper.emitted('update:categoryKey')).toEqual([['food']]);
  });

  it('marks the chosen category as pressed', () => {
    expect(button(mountForm({ categoryKey: 'food' }), 'Food').attributes('aria-pressed')).toBe('true');
  });

  it('does not save without a pattern or a category, and says what is missing', async () => {
    const wrapper = mountForm();

    await wrapper.find('form').trigger('submit');
    await button(wrapper, 'Save').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('saveAndApply')).toBeUndefined();
    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.text()).toContain('Enter a pattern to match.');
    expect(wrapper.text()).toContain('Choose a category.');
  });

  it('emits saveAndApply when the form is submitted with a valid draft', async () => {
    const wrapper = mountForm({ pattern: 'albert', categoryKey: 'food' });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('saveAndApply')).toHaveLength(1);
  });

  it('emits save from Save when the draft is valid', async () => {
    const wrapper = mountForm({ pattern: 'albert', categoryKey: 'food' });

    await button(wrapper, 'Save').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('save')).toHaveLength(1);
  });

  it('closes from Cancel', async () => {
    const wrapper = mountForm();

    await button(wrapper, 'Cancel').trigger('click');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('warns about a very short pattern but still allows saving', async () => {
    const wrapper = mountForm({ pattern: 'ah', categoryKey: 'food', preview: PREVIEW });

    expect(wrapper.find('[role="alert"]').text()).toContain('Very short pattern — “ah” matches 1 different description.');

    await button(wrapper, 'Save').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('save')).toHaveLength(1);
  });

  it('blocks saving a duplicate rule and names it', async () => {
    const wrapper = mountForm({ pattern: 'ziggo', categoryKey: 'food' });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('This rule already exists: contains “Ziggo” → Housing.');
    expect(wrapper.emitted('saveAndApply')).toBeUndefined();
  });

  it('shows no error before the user has submitted or typed', () => {
    const wrapper = mountForm();

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Enter a pattern to match.');
  });

  it('shows the preview once there is a pattern', () => {
    expect(mountForm({ pattern: 'albert heijn', preview: PREVIEW }).text()).toContain('3 matching');
    expect(mountForm({ pattern: '', preview: PREVIEW }).text()).not.toContain('matching');
  });
});
