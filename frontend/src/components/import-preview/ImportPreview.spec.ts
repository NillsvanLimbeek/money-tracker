import type { ImportRow } from '@/lib/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImportPreview from './ImportPreview.vue';

function row(date: string, amountCents: number, description: string): ImportRow {
  return { date, description, amountCents, rawCounterparty: null, mutationType: null, importHash: `${date}-${description}` };
}

const stubs = { UButton: { template: '<button><slot /></button>' }, UAlert: { template: '<div><slot name="description" /></div>' } };

describe('importPreview', () => {
  it('shows the count, day-month-year date range and totals', () => {
    const wrapper = mount(ImportPreview, {
      props: {
        rows: [row('2026-09-30', -654, 'OSP'), row('2026-09-25', 334126, 'Salaris'), row('2026-09-01', -1000, 'Huur')],
        errors: [],
        isSubmitting: false,
      },
      global: { stubs },
    });

    expect(wrapper.text()).toContain('3 transactions ready to import');
    expect(wrapper.text()).toContain('01-09-2026 – 30-09-2026');
    expect(wrapper.text()).toContain('3.341,26');
    expect(wrapper.text()).toContain('16,54');
  });

  it('lists parse errors with their line numbers', () => {
    const wrapper = mount(ImportPreview, {
      props: { rows: [row('2026-09-01', -100, 'A')], errors: [{ line: 7, message: 'Invalid amount "abc"' }], isSubmitting: false },
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Line 7: Invalid amount "abc"');
  });

  it('emits confirm and cancel', async () => {
    const wrapper = mount(ImportPreview, {
      props: { rows: [row('2026-09-01', -100, 'A')], errors: [], isSubmitting: false },
      global: { stubs },
    });
    const [cancel, confirm] = wrapper.findAll('button');

    await cancel!.trigger('click');
    await confirm!.trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });
});
