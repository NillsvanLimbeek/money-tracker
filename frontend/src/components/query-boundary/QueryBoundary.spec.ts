import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import QueryBoundary from './QueryBoundary.vue';

function mountBoundry(query: { isLoading?: boolean; error?: Error | null; data?: string }): VueWrapper {
  return mount(QueryBoundary, {
    props: {
      query: {
        isLoading: ref(query.isLoading ?? false),
        error: ref(query.error ?? null),
        data: ref(query.data),
      } as never,
    },
    slots: { default: '<template #default="{ data }"><p class="data">{{ data }}</p></template>' },
  });
}

describe('queryBoundry', () => {
  it('shows a loading state', () => {
    const wrapper = mountBoundry({ isLoading: true });

    expect(wrapper.text()).toContain('Loading...');
    expect(wrapper.find('.data').exists()).toBe(false);
  });

  it('shows the error', () => {
    const wrapper = mountBoundry({ error: new Error('boom') });

    expect(wrapper.text()).toContain('boom');
    expect(wrapper.find('.data').exists()).toBe(false);
  });

  it('passes the data to the default slot', () => {
    const wrapper = mountBoundry({ data: 'hello' });

    expect(wrapper.find('.data').text()).toBe('hello');
  });
});
