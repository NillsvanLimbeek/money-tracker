<script setup lang="ts">
import { subMonths } from 'date-fns';
import { computed } from 'vue';
import { formatPercent, percentChange } from '@/features/insights/utils';
import { formatCurrency, formatLocalised } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  month: Date;
  income: number;
  expense: number;
  previousIncome: number;
  previousExpense: number;
}

const { month, income, expense, previousIncome, previousExpense } = defineProps<Props>();

const net = computed(() => income - expense);
const netDelta = computed(() => net.value - (previousIncome - previousExpense));
const incomeDelta = computed(() => percentChange(income, previousIncome));
const expenseDelta = computed(() => percentChange(expense, previousExpense));

const monthLabel = computed(() => formatLocalised(month, 'MMM yyyy').toUpperCase());
const versus = computed(() => m.insights_vs_month({ month: formatLocalised(subMonths(month, 1), 'MMM') }));
const keptPercent = computed(() => (income > 0 ? Math.round((net.value / income) * 100) : null));
</script>

<template>
  <div class="flex flex-col gap-3 px-4">
    <section class="bg-default rounded-3xl p-6 shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <span class="text-muted font-mono text-xs tracking-widest uppercase">{{ m.insights_net({ month: monthLabel }) }}</span>
        <DeltaChip
          :label="`${formatCurrency(netDelta)} ${versus}`"
          :delta="netDelta"
        />
      </div>

      <p class="text-primary mt-6 font-mono text-4xl font-bold">
        {{ formatCurrency(net) }}
      </p>

      <p
        v-if="keptPercent !== null"
        class="text-muted mt-4 text-sm"
      >
        {{ m.insights_kept({ percent: keptPercent }) }}
      </p>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <section class="bg-default flex flex-col gap-3 rounded-3xl p-5 shadow-sm">
        <span class="text-muted flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
          <span class="bg-primary size-3 rounded-sm" />
          {{ m.insights_income() }}
        </span>
        <span class="text-primary font-mono text-xl font-bold">{{ formatCurrency(income) }}</span>
        <DeltaChip
          class="self-start"
          :label="`${formatPercent(incomeDelta)} ${versus}`"
          :delta="incomeDelta"
        />
      </section>

      <section class="bg-default flex flex-col gap-3 rounded-3xl p-5 shadow-sm">
        <span class="text-muted flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
          <span class="bg-inverted size-3 rounded-sm" />
          {{ m.insights_expenses() }}
        </span>
        <span class="text-highlighted font-mono text-xl font-bold">{{ formatCurrency(-expense) }}</span>
        <DeltaChip
          class="self-start"
          :label="`${formatPercent(expenseDelta)} ${versus}`"
          :delta="expenseDelta"
          :up-is-good="false"
        />
      </section>
    </div>
  </div>
</template>
