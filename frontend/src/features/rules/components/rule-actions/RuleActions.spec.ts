import type { VueWrapper } from '@vue/test-utils';
import type { CategoryRule } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RuleActions from './RuleActions.vue';

const RULE: CategoryRule = { id: 'r1', pattern: 'Albert Heijn', operator: 'startsWith', categoryKey: 'food', matches: 12 };

const stubs = {
  Drawer: {
    props: ['title', 'description'],
    template: '<div><h2>{{ title }}</h2><p>{{ description }}</p><slot name="body" /></div>',
  },
  Icon: { template: '<i />' },
};

function mountActions(rule: CategoryRule = RULE): VueWrapper {
  return mount(RuleActions, {
    props: { open: true, rule, categoryLabel: 'Food' },
    global: { stubs },
  });
}

const button = (wrapper: VueWrapper, label: string): ReturnType<VueWrapper['find']> => wrapper.findAll('button').find(item => item.text() === label)!;

describe('ruleActions', () => {
  it('shows the rule pattern in the title', () => {
    expect(mountActions().find('h2').text()).toContain('“Albert Heijn”');
  });

  it('describes the category and match count', () => {
    expect(mountActions().find('p').text()).toBe('Assigns Food · 12 matches');
  });

  it('uses the singular for a single match', () => {
    expect(mountActions({ ...RULE, matches: 1 }).find('p').text()).toBe('Assigns Food · 1 match');
  });

  it('emits edit from the Edit button', async () => {
    const wrapper = mountActions();

    await button(wrapper, 'Edit').trigger('click');

    expect(wrapper.emitted('edit')).toHaveLength(1);
  });

  it('emits delete from the Delete button', async () => {
    const wrapper = mountActions();

    await button(wrapper, 'Delete').trigger('click');

    expect(wrapper.emitted('delete')).toHaveLength(1);
  });
});
