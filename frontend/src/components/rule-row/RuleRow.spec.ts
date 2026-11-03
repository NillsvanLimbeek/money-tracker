import type { DOMWrapper, VueWrapper } from '@vue/test-utils';
import type { CategoryRule } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RuleRow from './RuleRow.vue';

const RULE: CategoryRule = { id: 'rule-1', pattern: 'Albert Heijn', operator: 'startsWith', categoryKey: 'food', matches: 12 };

const stubs = {
  Icon: { template: '<i class="icon" />' },
  Drawer: {
    props: ['open', 'title', 'description'],
    template: '<div v-if="open" class="drawer"><h2>{{ title }}</h2><p>{{ description }}</p><slot name="body" /></div>',
  },
};

function mountRow(rule: Partial<CategoryRule> = {}): VueWrapper {
  return mount(RuleRow, { props: { rule: { ...RULE, ...rule }, categoryLabel: 'Food' }, global: { stubs } });
}

async function chooseMenuItem(wrapper: VueWrapper, label: string): Promise<void> {
  await wrapper.find('[aria-label="Rule actions"]').trigger('click');
  await wrapper.findAll('.drawer button').find(item => item.text() === label)!.trigger('click');
}

async function openConfirmation(wrapper: VueWrapper): Promise<void> {
  await chooseMenuItem(wrapper, 'Delete');
}

function textOf(wrapper: VueWrapper): string {
  return wrapper.text().replaceAll('\u00A0', ' ');
}

function findButton(wrapper: VueWrapper, text: string): DOMWrapper<Element> {
  return wrapper.findAll('button').find(button => button.text() === text)!;
}

describe('ruleRow', () => {
  it('renders the operator, pattern, category and match count', () => {
    const wrapper = mountRow();

    expect(wrapper.text()).toContain('starts with');
    expect(wrapper.text()).toContain('“Albert Heijn”');
    expect(wrapper.text()).toContain('Food');
    expect(textOf(wrapper)).toContain('12 matches');
  });

  it('uses the singular for one match', () => {
    const text = textOf(mountRow({ matches: 1 }));

    expect(text).toContain('1 match');
    expect(text).not.toContain('1 matches');
  });

  it('hides the confirmation until Delete is chosen', async () => {
    const wrapper = mountRow();

    expect(wrapper.text()).not.toContain('Delete this rule?');

    await openConfirmation(wrapper);

    expect(wrapper.text()).toContain('Delete this rule?');
    expect(wrapper.text()).toContain('The 12 matched transactions keep their current category.');
  });

  it('dismisses the confirmation on Cancel without emitting', async () => {
    const wrapper = mountRow();

    await openConfirmation(wrapper);
    await findButton(wrapper, 'Cancel').trigger('click');

    expect(wrapper.text()).not.toContain('Delete this rule?');
    expect(wrapper.emitted('delete')).toBeUndefined();
  });

  it('emits delete with the rule id once confirmed', async () => {
    const wrapper = mountRow();

    await openConfirmation(wrapper);
    await findButton(wrapper, 'Delete rule').trigger('click');

    expect(wrapper.emitted('delete')).toEqual([['rule-1']]);
  });

  it('keeps the actions drawer closed until the menu button is pressed, and closes it on a choice', async () => {
    const wrapper = mountRow();

    expect(wrapper.find('.drawer').exists()).toBe(false);

    await wrapper.find('[aria-label="Rule actions"]').trigger('click');

    expect(wrapper.find('.drawer').exists()).toBe(true);

    await wrapper.findAll('.drawer button').find(item => item.text() === 'Edit')!.trigger('click');

    expect(wrapper.find('.drawer').exists()).toBe(false);
  });

  it('emits edit with the rule when Edit is chosen', async () => {
    const wrapper = mountRow();

    await chooseMenuItem(wrapper, 'Edit');

    expect(wrapper.emitted('edit')).toEqual([[RULE]]);
    expect(wrapper.text()).not.toContain('Delete this rule?');
  });
});
