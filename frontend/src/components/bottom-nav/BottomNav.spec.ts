import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '@/lib/constants/nav-items';
import BottomNav from './BottomNav.vue';

const route = vi.hoisted(() => ({ path: '/' }));
vi.mock('vue-router', () => ({ useRoute: () => route }));

const stubs = {
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  UIcon: { template: '<i />' },
};

function mountNav(path: string): VueWrapper {
  route.path = path;
  return mount(BottomNav, { global: { stubs } });
}

describe('bottomNav', () => {
  it('renders a link for every nav item', () => {
    const labels = mountNav('/insights').findAll('a').map(link => link.attributes('aria-label'));

    expect(labels).toEqual(NAV_ITEMS.map(item => item.label));
  });

  it('shows the import button only on the ledger', () => {
    expect(mountNav('/').find('[aria-label="Import transactions"]').exists()).toBe(true);
    expect(mountNav('/settings').find('[aria-label="Import transactions"]').exists()).toBe(false);
  });

  it('marks the current route as active', () => {
    const wrapper = mountNav('/budgets');

    expect(wrapper.find('[aria-label="Budgets"]').classes()).toContain('text-primary');
    expect(wrapper.find('[aria-label="Insights"]').classes()).toContain('text-muted');
  });
});
