import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DeltaChip from '../delta-chip/DeltaChip.vue';
import InsightsOverview from './InsightsOverview.vue';

function mountOverview(overrides: Record<string, unknown> = {}): VueWrapper {
  return mount(InsightsOverview, {
    props: { month: new Date(2026, 9, 1), income: 3000, expense: 1000, previousIncome: 2000, previousExpense: 1000, ...overrides },
  });
}

// Net, income and expenses each have one chip, in that order.
function chips(wrapper: VueWrapper): VueWrapper<InstanceType<typeof DeltaChip>>[] {
  return wrapper.findAllComponents(DeltaChip);
}

describe('insightsOverview', () => {
  it('shows the month in the net heading', () => {
    expect(mountOverview().text()).toContain('Net · OCT 2026');
  });

  it('shows the net, income and expenses', () => {
    const text = mountOverview().text();

    expect(text).toContain('€2.000,00');
    expect(text).toContain('€3.000,00');
    expect(text).toContain('−€1.000,00');
  });

  it('shows how much of the income was kept', () => {
    expect(mountOverview().text()).toContain('You kept 67% of your income.');
  });

  it('hides the kept line when there is no income', () => {
    expect(mountOverview({ income: 0, previousIncome: 0 }).text()).not.toContain('You kept');
  });

  it('compares with the previous month', () => {
    const [net, income, expenses] = chips(mountOverview());

    // Net went from 1000 to 2000.
    expect(net!.props('delta')).toBe(1000);
    expect(income!.props('delta')).toBe(50);
    expect(expenses!.props('delta')).toBe(0);
    expect(income!.props('label')).toBe('+50% vs Sep');
  });

  it('treats higher expenses as bad news and higher income as good news', () => {
    const [, income, expenses] = chips(mountOverview({ previousExpense: 500 }));

    expect(income!.props('upIsGood')).toBe(true);
    expect(expenses!.props('upIsGood')).toBe(false);
    expect(expenses!.props('delta')).toBe(100);
  });
});
