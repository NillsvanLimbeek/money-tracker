<script setup lang="ts">
import type { ImportSummary } from '@/lib/api/transactions/transactions.api';
import type { ParseResult } from '@/lib/utils';
import { computed, ref, watch } from 'vue';
import { useImportTransactions } from '@/lib/api/transactions/transactions.queries';
import { MAX_FILE_BYTES } from '@/lib/constants';
import { decodeIngCsv, parseIngCsv } from '@/lib/utils';

const MAX_IMPORT_ROWS = 5000;
const STEP_COUNT = 3;

const file = ref<File | null>(null);
const parsed = ref<ParseResult | null>(null);
const summary = ref<ImportSummary | null>(null);
const error = ref('');

const importMutation = useImportTransactions();

const step = computed(() => summary.value ? 3 : parsed.value ? 2 : 1);

const description = computed(() => {
  if (summary.value)
    return { title: 'Import complete', subtitle: 'Your transactions have been added to the ledger.' };

  if (parsed.value)
    return { title: 'Review transactions', subtitle: 'Check the rows below. Rows that could not be read are skipped.' };

  return {
    title: 'Import transactions',
    subtitle: 'Upload a CSV export from your bank. You\'ll check the columns and review every row before anything is added.',
  };
});

watch(file, async (selected) => {
  parsed.value = null;
  error.value = '';

  if (!selected)
    return;

  if (selected.size > MAX_FILE_BYTES) {
    error.value = 'This file is larger than 10 MB.';
    file.value = null;
    return;
  }

  const result = await parseIngCsv(decodeIngCsv(await selected.arrayBuffer()));

  if (result.rows.length === 0) {
    error.value = result.errors[0]?.message ?? 'No transactions found in this file.';
    file.value = null;
  }
  else if (result.rows.length > MAX_IMPORT_ROWS) {
    error.value = `This file has more than ${MAX_IMPORT_ROWS} transactions. Export a shorter period.`;
    file.value = null;
  }
  else {
    parsed.value = result;
  }
});

function selectFile(selected: File): void {
  file.value = selected;
}

function reset(): void {
  file.value = null;
  parsed.value = null;
  summary.value = null;
  error.value = '';
}

async function confirm(): Promise<void> {
  if (!parsed.value)
    return;

  error.value = '';

  try {
    summary.value = await importMutation.mutateAsync(parsed.value.rows);
    parsed.value = null;
  }
  catch {
    error.value = 'Import failed. Check your connection and try again.';
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <PageHeader title="Import">
      <template #left>
        <UButton
          to="/"
          color="neutral"
          variant="outline"
          size="xl"
          icon="i-lucide-x"
          aria-label="Close import"
        />
      </template>

      <template #right>
        <span class="text-muted font-mono text-sm">{{ step }}/{{ STEP_COUNT }}</span>
      </template>
    </PageHeader>

    <Stepper
      :step-count="STEP_COUNT"
      :step
    />

    <UAlert
      v-if="error"
      class="m-4"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="error"
    />

    <ImportDescription
      :title="description.title"
      :subtitle="description.subtitle"
    />

    <ImportSummary
      v-if="summary"
      :summary
      @reset="reset"
    />

    <ImportPreview
      v-else-if="parsed"
      :rows="parsed.rows"
      :errors="parsed.errors"
      :is-submitting="importMutation.isPending.value"
      @confirm="confirm"
      @cancel="reset"
    />

    <ImportFilePicker
      v-else
      @select="selectFile"
    />
  </div>
</template>
