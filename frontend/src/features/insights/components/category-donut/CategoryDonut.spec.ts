import type { VueWrapper } from '@vue/test-utils';
import type { CategorySpend } from '@/features/insights/utils';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryDonut from './CategoryDonut.vue';

// The canvas is not available in jsdom, so the chart is a stub that exposes what it was given.
vi.mock('vue-chartjs', () => ({
  Doughnut: { name: 'Doughnut', props: ['data', 'options'], template: '<canvas />' },
}));

const SPENDS: CategorySpend[] = [
  { categoryKey: 'housing', amount: 600, share: 60, change: 0 },
  { categoryKey: 'food', amount: 400, share: 40, change: 0 },
];

function mountDonut(props: { spends?: CategorySpend[]; activeKey?: string | null } = {}): VueWrapper {
  return mount(CategoryDonut, {
    props: { spends: SPENDS, ...props },
    slots: { default: '<span>Centre</span>' },
  });
}

interface ChartProps {
  data: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] };
  options: { onClick: (event: unknown, elements: { index: number }[]) => void };
}

function chart(wrapper: VueWrapper): ChartProps {
  return wrapper.findComponent({ name: 'Doughnut' }).props() as unknown as ChartProps;
}

describe('categoryDonut', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--chart-housing', '#111111');
    document.documentElement.style.setProperty('--chart-food', '#222222');
    document.documentElement.style.setProperty('--chart-other', '#999999');
  });

  afterEach(() => {
    for (const token of ['--chart-housing', '--chart-food', '--chart-other'])
      document.documentElement.style.removeProperty(token);
  });

  it('plots one segment per category', () => {
    const { data } = chart(mountDonut());

    expect(data.labels).toEqual(['housing', 'food']);
    expect(data.datasets[0]!.data).toEqual([600, 400]);
  });

  it('colours each segment from the theme and falls back to the "other" colour', () => {
    const { data } = chart(mountDonut({ spends: [...SPENDS, { categoryKey: 'mystery', amount: 10, share: 1, change: 0 }] }));

    expect(data.datasets[0]!.backgroundColor).toEqual(['#111111', '#222222', '#999999']);
  });

  it('dims the segments that are not highlighted', () => {
    const { data } = chart(mountDonut({ activeKey: 'food' }));

    expect(data.datasets[0]!.backgroundColor).toEqual(['#11111155', '#222222']);
  });

  it('emits the category of the clicked segment', () => {
    const wrapper = mountDonut();

    chart(wrapper).options.onClick({}, [{ index: 1 }]);

    expect(wrapper.emitted('select')).toEqual([['food']]);
  });

  it('emits null when the click misses every segment', () => {
    const wrapper = mountDonut();

    chart(wrapper).options.onClick({}, []);

    expect(wrapper.emitted('select')).toEqual([[null]]);
  });

  it('renders the default slot over the chart and labels it for screen readers', () => {
    const wrapper = mountDonut();

    expect(wrapper.text()).toContain('Centre');
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Spending by category');
  });
});
