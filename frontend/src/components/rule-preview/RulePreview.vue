<script setup lang="ts">
import type { RulePreview } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  preview: RulePreview;
}

defineProps<Props>();
</script>

<template>
  <section class="border-accented bg-default overflow-hidden rounded-2xl border">
    <header class="border-accented bg-elevated flex items-center justify-between border-b px-4 py-3">
      <span class="text-muted font-mono text-xs tracking-wide uppercase">Preview</span>
      <span class="text-highlighted font-semibold">{{ preview.count }} matching</span>
    </header>

    <ul
      v-if="preview.descriptions.length > 0"
      class="divide-accented flex max-h-56 flex-col divide-y overflow-y-auto"
    >
      <li
        v-for="group in preview.descriptions"
        :key="group.description"
        class="flex items-start justify-between gap-3 px-4 py-3"
      >
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-highlighted truncate">{{ group.description }}</span>

          <span class="text-muted font-mono text-xs">
            {{ formatDate(group.date) }}<template v-if="group.count > 1"> · ×{{ group.count }}</template>
          </span>
        </div>

        <span class="text-highlighted shrink-0 font-mono">{{ formatCurrency(group.amountCents / 100) }}</span>
      </li>
    </ul>

    <p
      v-else
      class="text-muted px-4 py-3 text-sm"
    >
      No transactions match yet.
    </p>
  </section>
</template>
