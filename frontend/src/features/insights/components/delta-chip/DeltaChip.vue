<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  /** The change, positive or negative. `0` renders as neutral. */
  delta: number;
  /** Whether an increase is good news (income) or bad news (expenses). */
  upIsGood?: boolean;
}

const { delta, upIsGood = true } = defineProps<Props>();

const tone = computed(() => {
  if (delta === 0)
    return 'bg-elevated text-muted';

  return (delta > 0) === upIsGood ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
});

const icon = computed(() => {
  if (delta === 0)
    return 'i-lucide-minus';

  return delta > 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down';
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs"
    :class="tone"
  >
    <UIcon
      :name="icon"
      class="size-4"
    />
    {{ label }}
  </span>
</template>
