import type { VueWrapper } from '@vue/test-utils';
import type { CategoryRule, RulePreview } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RulePromptDrawer from './RulePromptDrawer.vue';

const FOOD = { key: 'food', label: 'Food' };
const RULES: CategoryRule[] = [{ id: 'r1', pattern: 'Ziggo', operator: 'contains', categoryKey: 'housing', matches: 2 }];
const PREVIEW: RulePreview = { count: 3, descriptions: [{ description: 'Albert Heijn', count: 3, date: '2026-10-23', amountCents: -685 }] };

const stubs = {
  Drawer: { props: ['title'], template: '<div>{{ title }}<slot /><slot name="header" /><slot name="body" /></div>' },
  Icon: { template: '<i />' },
};

function mountPrompt(pattern = 'Albert Heijn', preview?: RulePreview): VueWrapper {
  return mount(RulePromptDrawer, {
    props: { open: true, pattern, category: FOOD, rules: RULES, preview },
    global: { stubs },
  });
}

const button = (wrapper: VueWrapper, label: string): ReturnType<VueWrapper['find']> => wrapper.findAll('button').find(item => item.text() === label)!;

describe('rulePromptDrawer', () => {
  it('names the chosen category in the title', () => {
    expect(mountPrompt().text()).toContain('Always categorise as Food?');
  });

  it('shows how many transactions the pattern matches', () => {
    expect(mountPrompt('Albert Heijn', PREVIEW).text()).toContain('Matches 3 transactions');
  });

  it('emits create from the Create rule button', async () => {
    const wrapper = mountPrompt();

    await button(wrapper, 'Create rule').trigger('click');

    expect(wrapper.emitted('create')).toHaveLength(1);
  });

  it('disables Create rule when the pattern duplicates an existing rule', () => {
    expect(button(mountPrompt('ziggo'), 'Create rule').attributes('disabled')).toBeDefined();
  });

  it('disables Create rule when the pattern is empty', () => {
    expect(button(mountPrompt(' '), 'Create rule').attributes('disabled')).toBeDefined();
  });
});
