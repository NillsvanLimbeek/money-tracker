import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ImportFilePicker from './ImportFilePicker.vue';

const stubs = { UButton: { template: '<button><slot /></button>' } };

describe('importFilePicker', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists only the banks the parser supports', () => {
    const wrapper = mount(ImportFilePicker, { global: { stubs } });

    expect(wrapper.findAll('li').map(item => item.text())).toEqual(['ING']);
    expect(wrapper.text()).toContain('max 10 MB');
  });

  it('emits the bundled sample file when "Try with a sample file" is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('"Date";"Name / Description"')));
    const wrapper = mount(ImportFilePicker, { global: { stubs } });

    await wrapper.findAll('button').find(button => button.text().includes('sample'))!.trigger('click');
    await vi.waitFor(() => expect(wrapper.emitted('select')).toHaveLength(1));

    const [file] = wrapper.emitted('select')![0] as [File];
    expect(file.name).toBe('sample-ing.csv');
  });
});
