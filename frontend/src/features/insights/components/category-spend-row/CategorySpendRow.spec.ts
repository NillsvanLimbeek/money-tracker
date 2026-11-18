import type { VueWrapper } from '@vue/test-utils';
import type { CategorySpend } from '@/features/insights/utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CategorySpendRow from './CategorySpendRow.vue';

const stubs = {
  RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' },
};

function mountRow(overrides: Partial<CategorySpend> = {}, dimmed?: boolean): VueWrapper {
  const spend: CategorySpend = { categoryKey: 'food', amount: 482.5, share: 26, change: 12, ...overrides };

  return mount(CategorySpendRow, { props: { spend, dimmed }, global: { stubs } });
}

describe('categorySpendRow', () => {
  it('shows the category label, amount and share', () => {
    const text = mountRow().text();

    expect(text).toContain('Food');
    expect(text).toContain('482');
    expect(text).toContain('26%');
  });

  it('falls back to the key for a category it does not know', () => {
    expect(mountRow({ categoryKey: 'mystery' }).text()).toContain('mystery');
  });

  it('links to the transactions page filtered by the category', () => {
    const link = mountRow({ categoryKey: 'transport' }).find('a');

    expect(JSON.parse(link.attributes('data-to')!)).toEqual({ path: '/', query: { category: 'transport' } });
  });

  it('sizes the bar to the share', () => {
    const bar = mountRow({ share: 40 }).find('[style*="width"]');

    expect((bar.element as HTMLElement).style.width).toBe('40%');
  });

  it.each([
    ['more', 12, '+12%', 'text-error'],
    ['less', -18, '−18%', 'text-success'],
    ['the same', 0, '±0%', 'text-muted'],
  ])('shows spending %s as %s in %s', (_name, change, label, tone) => {
    const changeEl = mountRow({ change }).findAll('span').find(span => span.text() === label);

    expect(changeEl).toBeDefined();
    expect(changeEl!.classes()).toContain(tone);
  });

  it('fades the row only when dimmed', () => {
    expect(mountRow({}, true).find('.opacity-40').exists()).toBe(true);
    expect(mountRow({}, true).find('.text-highlighted').exists()).toBe(false);
    expect(mountRow({}, false).find('.opacity-40').exists()).toBe(false);
    expect(mountRow().find('.opacity-40').exists()).toBe(false);
  });
});
