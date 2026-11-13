<script setup lang="ts">
import type { CategorySpend } from '@/features/insights/utils';
import { computed } from 'vue';
import { formatPercent } from '@/features/insights/utils';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories';
import { formatEuros } from '@/lib/utils';

interface Props {
  spend: CategorySpend;
  /** Fades the row while another category is highlighted. */
  dimmed?: boolean;
}

const { spend, dimmed = false } = defineProps<Props>();

const label = computed(() => CATEGORIES.find(category => category.key === spend.categoryKey)?.label ?? spend.categoryKey);
const color = computed(() => `var(--chart-${spend.categoryKey}, var(--chart-other))`);

const changeLabel = computed(() => (spend.change === 0 ? '±0%' : formatPercent(spend.change)));
// Spending more is bad news, spending less is good news.
const changeTone = computed(() => {
  if (spend.change === 0)
    return 'text-muted';

  return spend.change > 0 ? 'text-error' : 'text-success';
});
</script>

<template>
  <RouterLink
    :to="{ path: '/', query: { category: spend.categoryKey } }"
    class="flex items-center gap-4 transition-opacity"
    :class="{ 'opacity-40': dimmed }"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-2xl"
      :style="{ backgroundColor: `color-mix(in srgb, ${color} 12%, var(--ui-bg))`, color }"
    >
      <UIcon
        :name="CATEGORY_ICONS[spend.categoryKey] ?? CATEGORY_ICONS.other!"
        class="size-5"
      />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-baseline justify-between gap-2">
        <span class="text-highlighted truncate text-base font-medium">{{ label }}</span>
        <span class="text-highlighted font-mono text-base font-bold">{{ formatEuros(spend.amount) }}</span>
      </div>

      <div class="mt-2 flex items-center gap-3">
        <div class="bg-elevated h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            class="h-full rounded-full"
            :style="{ width: `${spend.share}%`, minWidth: '6px', backgroundColor: color }"
          />
        </div>
        <span class="text-muted w-10 text-right font-mono text-sm">{{ spend.share }}%</span>
        <span
          class="w-12 text-right font-mono text-sm font-medium"
          :class="changeTone"
        >{{ changeLabel }}</span>
      </div>
    </div>

    <UIcon
      name="i-lucide-chevron-right"
      class="text-dimmed size-5 shrink-0"
    />
  </RouterLink>
</template>
