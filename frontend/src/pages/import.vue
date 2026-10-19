<script setup lang="ts">
import type { ImportSummary } from '@/lib/api/transactions/transactions.api';
import type { ParseResult } from '@/lib/utils';
import { ref, watch } from 'vue';
import ImportPreview from '@/components/ImportPreview.vue';
import { useImportTransactions } from '@/lib/api/transactions/transactions.queries';
import { decodeIngCsv, parseIngCsv } from '@/lib/utils';

const MAX_IMPORT_ROWS = 5000;

const file = ref<File | null>(null);
const parsed = ref<ParseResult | null>(null);
const summary = ref<ImportSummary | null>(null);
const error = ref('');

const importMutation = useImportTransactions();

watch(file, async (selected) => {
  parsed.value = null;
  error.value = '';

  if (!selected)
    return;

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
  <div class="bg-olive-50 sticky top-0 z-10 flex items-center gap-2 p-4">
    <UButton
      to="/"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      aria-label="Back to ledger"
    />
    <h1 class="text-highlighted text-xl font-bold">
      Import
    </h1>
  </div>

  <div
    v-if="summary"
    class="flex flex-col items-center gap-4 p-4 pt-16 text-center"
  >
    <UIcon
      name="i-lucide-circle-check"
      class="text-primary size-10"
    />
    <div class="flex flex-col gap-1">
      <p class="text-highlighted text-lg font-semibold">
        {{ summary.imported }} imported
      </p>
      <p class="text-muted text-sm">
        {{ summary.skipped }} skipped as duplicates
      </p>
    </div>
    <div class="flex gap-3">
      <UButton
        color="neutral"
        variant="outline"
        @click="reset"
      >
        Import another
      </UButton>
      <UButton to="/">
        View ledger
      </UButton>
    </div>
  </div>

  <ImportPreview
    v-else-if="parsed"
    :rows="parsed.rows"
    :errors="parsed.errors"
    :is-submitting="importMutation.isPending.value"
    @confirm="confirm"
    @cancel="reset"
  />

  <div
    v-else
    class="flex flex-col gap-4 p-4"
  >
    <UFileUpload
      v-model="file"
      accept=".csv,text/csv"
      label="Drop your ING export here"
      description="CSV from “Download transactions”"
      icon="i-lucide-file-spreadsheet"
      class="min-h-48"
    />
  </div>

  <UAlert
    v-if="error"
    class="mx-4"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :description="error"
  />

  <div class="h-28" />
</template>
