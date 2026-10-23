import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DesktopBlocker from './DesktopBlocker.vue';

describe('desktopBlocker', () => {
  it('tells the user the app is mobile only', () => {
    const text = mount(DesktopBlocker).text();

    expect(text).toContain('Mobile only');
    expect(text).toContain('designed for mobile devices');
  });
});
