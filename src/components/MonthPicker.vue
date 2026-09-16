<script setup lang="ts">
import { addMonths, differenceInCalendarMonths, format } from 'date-fns';
import { computed } from 'vue';

const modelValue = defineModel<Date>({ required: true });

const monthLabel = computed(() => format(modelValue.value, 'MMMM yyyy'));

const relativeLabel = computed(() => {
  const diff = differenceInCalendarMonths(modelValue.value, new Date());

  if (diff === 0)
    return 'This month';
  if (diff === 1)
    return 'Next month';
  if (diff === -1)
    return 'Last month';
  return diff > 0 ? `In ${diff} months` : `${Math.abs(diff)} months ago`;
});

function shiftMonth(delta: number) {
  modelValue.value = addMonths(modelValue.value, delta);
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 px-4 py-4">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-chevron-left"
      square
      size="lg"
      class="rounded-lg"
      aria-label="Previous month"
      @click="shiftMonth(-1)"
    />

    <div class="flex flex-col items-center gap-1">
      <span class="text-lg font-bold text-highlighted">{{ monthLabel }}</span>
      <span class="font-mono text-xs uppercase tracking-wide text-muted">{{ relativeLabel }}</span>
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-chevron-right"
      square
      size="lg"
      class="rounded-lg"
      aria-label="Next month"
      @click="shiftMonth(1)"
    />
  </div>
</template>
