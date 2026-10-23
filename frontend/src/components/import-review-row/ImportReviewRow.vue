<script setup lang="ts">
import type { ImportRow } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { computed, ref } from 'vue';
import CategoryBadge from '@/components/category-badge/CategoryBadge.vue';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency, splitNotes } from '@/lib/utils';

interface Props {
  row: ImportRow;
  selected: boolean;
  duplicate: boolean;
}

const { row, selected, duplicate } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const expanded = ref(false);

const date = computed(() => parseISO(row.date));
const amountClass = computed(() => {
  if (duplicate)
    return 'text-muted';
  return row.amountCents > 0 ? 'text-primary' : 'text-highlighted';
});
const noteLines = computed(() => (row.notes ? splitNotes(row.notes) : []));

// Mirrors the placeholder the import route stores until keyword categorisation lands.
const category = computed(() => {
  const key = row.amountCents > 0 ? 'income' : 'other';
  return CATEGORIES.find(category => category.key === key)!;
});
</script>

<template>
  <div
    class="flex w-full cursor-pointer items-stretch text-left"
    :class="{ 'opacity-60': duplicate }"
    @click="expanded = !expanded"
  >
    <div class="flex min-w-0 flex-1 items-start gap-3 py-4 pr-3 pl-4">
      <UCheckbox
        :model-value="selected"
        :disabled="duplicate"
        :aria-label="row.description"
        size="lg"
        class="mt-0.5"
        @click.stop
        @update:model-value="emit('toggle')"
      />

      <div class="text-muted flex w-9 shrink-0 flex-col items-start pt-0.5 font-mono text-xs leading-tight uppercase">
        <p>{{ format(date, 'dd') }}</p>
        <p>{{ format(date, 'MMM') }}</p>
      </div>

      <div class="flex min-w-0 flex-1 flex-col items-start gap-2">
        <p
          class="w-full font-semibold"
          :class="{
            'text-muted': duplicate,
            'text-highlighted': !duplicate,
            'wrap-break-word': expanded,
            'truncate': !expanded,
          }"
        >
          {{ row.description }}
        </p>

        <div
          v-if="expanded && noteLines.length"
          class="border-accented bg-elevated w-full rounded-xl border px-3 py-2"
        >
          <p class="text-muted font-mono text-xs tracking-wide uppercase">
            Bank description
          </p>
          <p
            v-for="line in noteLines"
            :key="line"
            class="text-toned font-mono text-sm wrap-break-word"
          >
            {{ line }}
          </p>
        </div>

        <p
          v-if="duplicate"
          class="border-accented text-muted rounded-full border border-dashed px-3 py-1 text-xs"
        >
          Already imported
        </p>

        <CategoryBadge
          v-else
          :category-key="category.key"
          :label="category.label"
          :show-icon="false"
          :interactive="false"
        />
      </div>

      <p
        class="shrink-0 font-bold"
        :class="amountClass"
      >
        {{ formatCurrency(row.amountCents / 100) }}
      </p>
    </div>

    <div class="border-accented flex w-12 shrink-0 items-start justify-center border-l pt-4.5">
      <button
        type="button"
        class="text-muted hover:text-highlighted cursor-pointer"
        :aria-expanded="expanded"
        aria-label="Toggle details"
      >
        <UIcon
          :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>
