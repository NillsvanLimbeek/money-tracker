<script setup lang="ts">
import type { ImportRow, ImportSummary } from '@/lib/types';
import { computed } from 'vue';
import { formatCurrency, formatPeriod } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  summary: ImportSummary;
  // The rows that were sent to the import route.
  rows: ImportRow[];
  fileName: string;
}

const { summary, rows, fileName } = defineProps<Props>();
const emit = defineEmits<{ (e: 'reset'): void }>();

const income = computed(() => rows
  .filter(row => row.amountCents > 0)
  .reduce((sum, row) => sum + row.amountCents, 0) / 100);
const expense = computed(() => rows
  .filter(row => row.amountCents < 0)
  .reduce((sum, row) => sum - row.amountCents, 0) / 100);

// Until keyword categorisation lands every debit is stored as "Other".
const uncategorised = computed(() => rows.filter(row => row.amountCents < 0).length);

const period = computed(() => formatPeriod(rows.map(row => row.date)));

const stats = computed(() => [
  { label: m.summary_in(), value: formatCurrency(income.value), valueClass: 'text-primary' },
  { label: m.summary_out(), value: formatCurrency(-expense.value) },
  { label: m.import_stat_skipped(), value: summary.skipped },
]);
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-col gap-6 p-4">
      <div class="flex flex-col items-center gap-4 pt-12 text-center">
        <div class="bg-primary/10 flex size-20 items-center justify-center rounded-full">
          <UIcon
            name="i-lucide-check"
            class="text-primary size-8"
          />
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-highlighted text-2xl font-bold">
            {{ m.import_done_title({ count: summary.imported }) }}
          </h2>

          <p class="text-muted">
            {{ m.import_done_added({ fileName, period }) }}
          </p>
        </div>
      </div>

      <StatStrip :stats />

      <RouterLink
        v-if="uncategorised > 0"
        to="/"
        class="border-accented bg-default flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm"
      >
        <span class="border-accented bg-elevated text-muted rounded-full border border-dashed px-3 py-1 text-xs font-medium">
          {{ m.import_uncategorised() }}
        </span>

        <span class="text-muted flex-1">
          {{ m.import_needs_category({ count: uncategorised }) }}
        </span>

        <UIcon
          name="i-lucide-chevron-right"
          class="text-muted size-4"
        />
      </RouterLink>
    </div>

    <div class="border-accented bg-olive-50 sticky bottom-0 flex flex-col items-center gap-3 border-t p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <UButton
        to="/"
        block
        size="xl"
        color="neutral"
        class="justify-center rounded-2xl py-4"
      >
        {{ m.import_view_transactions() }}
      </UButton>

      <UButton
        variant="link"
        @click="emit('reset')"
      >
        {{ m.import_another_file() }}
      </UButton>
    </div>
  </div>
</template>
