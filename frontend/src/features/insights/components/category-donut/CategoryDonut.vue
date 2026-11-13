<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js';
import type { CategorySpend } from '@/features/insights/utils';
import { ArcElement, Chart as ChartJS, DoughnutController } from 'chart.js';
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { m } from '@/paraglide/messages';

const { spends, activeKey = null } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', categoryKey: string | null): void;
}>();

ChartJS.register(ArcElement, DoughnutController);

interface Props {
  spends: CategorySpend[];
  /** The category to highlight, the others are dimmed. */
  activeKey?: string | null;
}

// The canvas cannot resolve `var(--x)`, so the theme's tokens are read once per render.
function cssColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function segmentColor(categoryKey: string): string {
  const color = cssColor(`--chart-${categoryKey}`) || cssColor('--chart-other');

  return activeKey === null || activeKey === categoryKey ? color : `${color}55`;
}

const data = computed<ChartData<'doughnut'>>(() => ({
  labels: spends.map(spend => spend.categoryKey),
  datasets: [{
    data: spends.map(spend => spend.amount),
    backgroundColor: spends.map(spend => segmentColor(spend.categoryKey)),
    borderColor: cssColor('--ui-bg'),
    borderWidth: 3,
    borderRadius: 3,
  }],
}));

const options = computed<ChartOptions<'doughnut'>>(() => ({
  // A half circle, from the left over the top to the right, in a canvas twice as wide as it is tall.
  rotation: -90,
  circumference: 180,
  aspectRatio: 2,
  cutout: '68%',
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  onClick: (_event, elements) => emit('select', spends[elements[0]?.index ?? -1]?.categoryKey ?? null),
}));
</script>

<template>
  <div
    class="relative mx-auto w-full max-w-sm"
    role="img"
    :aria-label="m.insights_spending_chart_label()"
  >
    <Doughnut
      :data
      :options
    />

    <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
      <slot />
    </div>
  </div>
</template>
