<script setup lang="ts">
import type { ImportSummary } from '@/lib/api/transactions/transactions.api';
import type { ImportRow } from '@/lib/types';
import type { ParseResult } from '@/lib/utils';
import { computed, ref, watch } from 'vue';
import { getImportedHashes } from '@/lib/api/transactions/transactions.api';
import { useImportTransactions } from '@/lib/api/transactions/transactions.queries';
import { MAX_FILE_BYTES } from '@/lib/constants';
import { decodeIngCsv, parseIngCsv } from '@/lib/utils';

const MAX_IMPORT_ROWS = 5000;
const STEP_COUNT = 3;

const file = ref<File | null>(null);
const parsed = ref<ParseResult | null>(null);
const duplicateHashes = ref<string[]>([]);
const summary = ref<ImportSummary | null>(null);
const importedRows = ref<ImportRow[]>([]);
const error = ref('');

const importMutation = useImportTransactions();

// Review is step 3; the column check that will become step 2 isn't built yet.
const step = computed(() => summary.value || parsed.value ? 3 : 1);

const description = computed(() => {
  if (parsed.value)
    return { title: 'Review', subtitle: 'Untick anything you don\'t want. Categories can be changed later from the list.' };

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
    duplicateHashes.value = await findDuplicateHashes(result.rows);
    parsed.value = result;
  }
});

// Flags rows that are already stored. If the lookup fails the review still works,
// because the import route skips duplicates anyway.
async function findDuplicateHashes(rows: ImportRow[]): Promise<string[]> {
  const dates = rows.map(row => row.date).sort();

  try {
    return await getImportedHashes(dates[0]!, dates.at(-1)!);
  }
  catch {
    return [];
  }
}

function selectFile(selected: File): void {
  file.value = selected;
}

function reset(): void {
  file.value = null;
  parsed.value = null;
  summary.value = null;
  importedRows.value = [];
  error.value = '';
}

async function confirm(rows: ImportRow[]): Promise<void> {
  error.value = '';

  try {
    summary.value = await importMutation.mutateAsync(rows);
    importedRows.value = rows;
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
          v-if="parsed || summary"
          color="neutral"
          variant="outline"
          size="xl"
          icon="i-lucide-chevron-left"
          aria-label="Back to file selection"
          @click="reset"
        />

        <UButton
          v-else
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
      v-if="!summary"
      :title="description.title"
      :subtitle="description.subtitle"
    />

    <ImportSummary
      v-if="summary"
      :summary
      :rows="importedRows"
      :file-name="file?.name ?? ''"
      @reset="reset"
    />

    <ImportReview
      v-else-if="parsed"
      :rows="parsed.rows"
      :errors="parsed.errors"
      :duplicate-hashes="duplicateHashes"
      :is-submitting="importMutation.isPending.value"
      @confirm="confirm"
    />

    <ImportFilePicker
      v-else
      @select="selectFile"
    />
  </div>
</template>
