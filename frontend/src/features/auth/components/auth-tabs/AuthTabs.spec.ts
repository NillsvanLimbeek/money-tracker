import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AuthTabs from './AuthTabs.vue';

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } };

describe('authTabs', () => {
  it('links to both auth pages', () => {
    const links = mount(AuthTabs, { props: { active: 'signin' }, global: { stubs } }).findAll('a');

    expect(links.map(link => link.attributes('href'))).toEqual(['/signin', '/signup']);
  });

  it.each([
    ['signin', 0],
    ['signup', 1],
  ] as const)('highlights only the %s tab when active', (active, index) => {
    const links = mount(AuthTabs, { props: { active }, global: { stubs } }).findAll('a');

    expect(links[index]!.classes()).toContain('text-highlighted');
    expect(links[1 - index]!.classes()).toContain('text-muted');
  });
});
