<script setup lang="ts">
import type { ImportRow, ImportSummary } from '@/lib/types';
import type { ParseResult } from '@/lib/utils';
import { computed, ref, watch } from 'vue';
import { useCategoryRules } from '@/lib/api/category-rules/category-rules.queries';
import { getImportedHashes } from '@/lib/api/transactions/transactions.api';
import { useImportTransactions } from '@/lib/api/transactions/transactions.queries';
import { MAX_FILE_BYTES } from '@/lib/constants';
import { decodeIngCsv, parseIngCsv } from '@/lib/utils';
import { m } from '@/paraglide/messages';

const MAX_IMPORT_ROWS = 5000;
const STEP_COUNT = 2;

const file = ref<File | null>(null);
const parsed = ref<ParseResult | null>(null);
const duplicateHashes = ref<string[]>([]);
const summary = ref<ImportSummary | null>(null);
const importedRows = ref<ImportRow[]>([]);
const error = ref('');

const importMutation = useImportTransactions();
const rulesQuery = useCategoryRules();

const step = computed(() => parsed.value ? 2 : 1);

const description = computed(() => {
  if (parsed.value)
    return { title: m.import_review_heading(), subtitle: m.import_review_subtitle() };

  return {
    title: m.import_heading(),
    subtitle: m.import_subtitle(),
  };
});

watch(file, async (selected) => {
  parsed.value = null;
  error.value = '';

  if (!selected)
    return;

  if (selected.size > MAX_FILE_BYTES) {
    error.value = m.import_error_too_large({ size: `${MAX_FILE_BYTES / 1024 / 1024} MB` });
    file.value = null;
    return;
  }

  const result = await parseIngCsv(decodeIngCsv(await selected.arrayBuffer()));

  if (result.rows.length === 0) {
    error.value = result.errors[0]?.message ?? m.import_error_no_transactions();
    file.value = null;
  }
  else if (result.rows.length > MAX_IMPORT_ROWS) {
    error.value = m.import_error_too_many({ max: MAX_IMPORT_ROWS });
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
    error.value = m.import_error_failed();
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <PageHeader :title="m.import_title()">
      <template #left>
        <UButton
          v-if="parsed || summary"
          color="neutral"
          variant="outline"
          size="xl"
          icon="i-lucide-chevron-left"
          :aria-label="m.import_back_aria()"
          @click="reset"
        />

        <UButton
          v-else
          to="/"
          color="neutral"
          variant="outline"
          size="xl"
          icon="i-lucide-x"
          :aria-label="m.import_close_aria()"
        />
      </template>

      <template #right>
        <span
          v-if="!summary"
          class="text-muted font-mono text-sm"
        >{{ step }}/{{ STEP_COUNT }}</span>
      </template>
    </PageHeader>

    <Stepper
      v-if="!summary"
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
      :rules="rulesQuery.data.value"
      :is-submitting="importMutation.isPending.value"
      @confirm="confirm"
    />

    <ImportFilePicker
      v-else
      @select="selectFile"
    />
  </div>
</template>
