import type { VueWrapper } from '@vue/test-utils';
import type { CategoryRule } from '@/lib/types';
import type { RuleGroup as RuleGroupData } from '@/lib/utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RuleGroup from './RuleGroup.vue';

const RULES: CategoryRule[] = [
  { id: 'rule-1', pattern: 'Albert Heijn', operator: 'startsWith', categoryKey: 'food', matches: 12 },
  { id: 'rule-2', pattern: 'Jumbo', operator: 'contains', categoryKey: 'food', matches: 3 },
];

const stubs = {
  Icon: { template: '<i class="icon" />' },
  Drawer: {
    props: ['open', 'title', 'description'],
    template: '<div v-if="open" class="drawer"><h2>{{ title }}</h2><p>{{ description }}</p><slot name="body" /></div>',
  },
};

function mountGroup(group: Partial<RuleGroupData> = {}): VueWrapper {
  return mount(RuleGroup, {
    props: { group: { category: { key: 'food', label: 'Food' }, rules: RULES, matches: 15, ...group } },
    global: { stubs },
  });
}

async function chooseMenuItem(wrapper: VueWrapper, row: number, label: string): Promise<void> {
  await wrapper.findAll('[aria-label="Rule actions"]')[row]!.trigger('click');
  await wrapper.findAll('.drawer button').find(item => item.text() === label)!.trigger('click');
}

describe('ruleGroup', () => {
  it('renders the category with its rule and match totals', () => {
    const text = mountGroup().find('header').text();

    expect(text).toContain('Food');
    expect(text).toContain('2 rules · 15 categorised');
  });

  it('uses the singular for a single rule', () => {
    const text = mountGroup({ rules: [RULES[0]!] }).find('header').text();

    expect(text).toContain('1 rule ·');
  });

  it('renders a row per rule', () => {
    const text = mountGroup().text();

    expect(text).toContain('“Albert Heijn”');
    expect(text).toContain('“Jumbo”');
  });

  it('re-emits delete from a row with the rule id', async () => {
    const wrapper = mountGroup();

    await chooseMenuItem(wrapper, 1, 'Delete');
    await wrapper.findAll('button').find(button => button.text() === 'Delete rule')!.trigger('click');

    expect(wrapper.emitted('delete')).toEqual([['rule-2']]);
  });

  it('re-emits edit from a row with the rule', async () => {
    const wrapper = mountGroup();

    await chooseMenuItem(wrapper, 1, 'Edit');

    expect(wrapper.emitted('edit')).toEqual([[RULES[1]]]);
  });
});
