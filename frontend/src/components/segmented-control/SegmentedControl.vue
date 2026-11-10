<script setup lang="ts" generic="T extends string">
interface Props {
  options: { value: T; label: string }[];
  ariaLabel?: string;
}

const { options, ariaLabel } = defineProps<Props>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="radiogroup"
    :aria-label
    class="border-accented bg-elevated flex gap-1 rounded-xl border p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      class="rounded-lg px-4 py-1.5 font-medium"
      :class="{
        'bg-default text-highlighted shadow-sm': model === option.value,
        'text-muted': model !== option.value,
      }"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
