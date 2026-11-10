<script setup lang="ts">
import { addMonths, format } from 'date-fns';
import { computed } from 'vue';
import CurrencyAmount from '@/components/currency-amount/CurrencyAmount.vue';
import { dateFnsLocale } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  income: number;
  expense: number;
}

const { income, expense } = defineProps<Props>();

const modelValue = defineModel<Date>({ required: true });

const monthLabel = computed(() => format(modelValue.value, 'MMMM yyyy', { locale: dateFnsLocale() }));
const net = computed(() => income - expense);

function shiftMonth(delta: number): void {
  modelValue.value = addMonths(modelValue.value, delta);
}
</script>

<template>
  <div class="border-accented bg-default mx-4 mt-4 rounded-2xl border shadow-sm">
    <div class="flex items-center justify-between px-4 py-4">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-chevron-left"
        square
        class="bg-accented rounded-lg"
        :aria-label="m.month_previous()"
        @click="shiftMonth(-1)"
      />

      <span class="text-highlighted text-md font-bold">{{ monthLabel }}</span>

      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-chevron-right"
        square
        class="bg-accented rounded-lg"
        :aria-label="m.month_next()"
        @click="shiftMonth(1)"
      />
    </div>

    <div class="border-accented flex items-end justify-between border-t px-4 py-4">
      <CurrencyAmount
        :label="m.summary_in()"
        :value="income"
        class="text-primary text-sm"
      />

      <CurrencyAmount
        :label="m.summary_out()"
        :value="-expense"
        class="text-highlighted text-sm"
      />

      <CurrencyAmount
        :label="m.summary_net()"
        :value="net"
        class="text-highlighted pt-1 text-lg"
        align="end"
      />
    </div>
  </div>
</template>
