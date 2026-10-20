<script setup lang="ts">
import type { ImportSummary } from '@/lib/api/transactions/transactions.api';

interface Props {
  summary: ImportSummary;
}

const { summary } = defineProps<Props>();
const emit = defineEmits<{ (e: 'reset'): void }>();
</script>

<template>
  <div
    v-if="summary"
    class="flex flex-col items-center gap-4 p-4 pt-8 text-center"
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
        @click="emit('reset')"
      >
        Import another
      </UButton>
      <UButton to="/">
        View ledger
      </UButton>
    </div>
  </div>
</template>
