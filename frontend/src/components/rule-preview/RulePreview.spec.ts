import type { RulePreview as Preview } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RulePreview from './RulePreview.vue';

const PREVIEW: Preview = {
  count: 20,
  descriptions: [
    { description: 'AH to go 5821 Amsterdam CS', count: 19, date: '2026-10-23', amountCents: -685 },
    { description: 'Mahler Apotheek', count: 1, date: '2026-10-02', amountCents: -1235 },
  ],
};

describe('rulePreview', () => {
  it('shows how many transactions match', () => {
    expect(mount(RulePreview, { props: { preview: PREVIEW } }).text()).toContain('20 matching');
  });

  it('shows each description with its date and amount', () => {
    const text = mount(RulePreview, { props: { preview: PREVIEW } }).text();

    expect(text).toContain('AH to go 5821 Amsterdam CS');
    expect(text).toContain('23-10-2026');
    expect(text).toContain('−€6,85');
  });

  it('shows how often a description repeats, but not for a single transaction', () => {
    const items = mount(RulePreview, { props: { preview: PREVIEW } }).findAll('li');

    expect(items[0]!.text()).toContain('×19');
    expect(items[1]!.text()).not.toContain('×');
  });

  it('says so when nothing matches', () => {
    const wrapper = mount(RulePreview, { props: { preview: { count: 0, descriptions: [] } } });

    expect(wrapper.text()).toContain('0 matching');
    expect(wrapper.text()).toContain('No transactions match yet.');
  });
});
