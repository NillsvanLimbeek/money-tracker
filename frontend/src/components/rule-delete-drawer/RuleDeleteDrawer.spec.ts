import type { VueWrapper } from '@vue/test-utils';
import type { CategoryRule } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RuleDeleteDrawer from './RuleDeleteDrawer.vue';

const RULE: CategoryRule = { id: 'r1', pattern: 'Albert Heijn', operator: 'startsWith', categoryKey: 'food', matches: 12 };

const stubs = {
  Drawer: {
    props: ['title', 'description'],
    template: '<div><h2>{{ title }}</h2><p>{{ description }}</p><slot name="body" /></div>',
  },
  Icon: { template: '<i />' },
};

function mountDrawer(rule: CategoryRule = RULE): VueWrapper {
  return mount(RuleDeleteDrawer, { props: { open: true, rule }, global: { stubs } });
}

const button = (wrapper: VueWrapper, label: string): ReturnType<VueWrapper['find']> => wrapper.findAll('button').find(item => item.text() === label)!;

describe('ruleDeleteDrawer', () => {
  it('asks for confirmation', () => {
    expect(mountDrawer().find('h2').text()).toBe('Delete this rule?');
  });

  it('explains that matched transactions keep their category', () => {
    expect(mountDrawer().find('p').text()).toBe('The 12 matched transactions keep their current category.');
  });

  it('uses the singular for a single match', () => {
    expect(mountDrawer({ ...RULE, matches: 1 }).find('p').text()).toBe('The 1 matched transaction keeps their current category.');
  });

  it('emits delete from the Delete rule button', async () => {
    const wrapper = mountDrawer();

    await button(wrapper, 'Delete rule').trigger('click');

    expect(wrapper.emitted('delete')).toHaveLength(1);
  });

  it('closes from the Cancel button without deleting', async () => {
    const wrapper = mountDrawer();

    await button(wrapper, 'Cancel').trigger('click');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    expect(wrapper.emitted('delete')).toBeUndefined();
  });
});
