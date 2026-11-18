<script setup lang="ts">
import { addMonths } from 'date-fns';
import { computed } from 'vue';
import { formatLocalised } from '@/lib/utils';
import { m } from '@/paraglide/messages';

defineEmits<{ open: [] }>();

const modelValue = defineModel<Date>({ required: true });

const monthLabel = computed(() => formatLocalised(modelValue.value, 'MMMM yyyy'));

function shiftMonth(delta: number): void {
  modelValue.value = addMonths(modelValue.value, delta);
}
</script>

<template>
  <div class="flex items-stretch gap-3 px-4">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-chevron-left"
      square
      size="xl"
      class="bg-default size-12 shrink-0 justify-center rounded-xl"
      :aria-label="m.month_previous()"
      @click="shiftMonth(-1)"
    />

    <UButton
      color="neutral"
      variant="outline"
      size="xl"
      block
      class="bg-default text-highlighted flex-1 justify-center rounded-xl p-3 font-semibold"
      :aria-label="`${m.month_pick()}: ${monthLabel}`"
      @click="$emit('open')"
    >
      {{ monthLabel }} <UIcon name="i-lucide-chevron-down" />
    </UButton>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-chevron-right"
      square
      size="xl"
      class="bg-default size-12 shrink-0 justify-center rounded-xl"
      :aria-label="m.month_next()"
      @click="shiftMonth(1)"
    />
  </div>
</template>
