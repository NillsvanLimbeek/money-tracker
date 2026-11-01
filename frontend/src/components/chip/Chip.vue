<script setup lang="ts">
interface Props {
  chip: {
    key: string;
    label: string;
    count: number;
  };
  selected: string | null;
}

const { chip } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', payload: string): void;
}>();
</script>

<template>
  <button
    type="button"
    class="border-accented flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-medium"
    :class="{
      'border-primary bg-primary/10 text-primary': selected === chip.key,
      'bg-default text-highlighted': selected !== chip.key }"
    @click="emit('select', chip.key)"
  >
    {{ chip.label }} <span class="font-mono text-sm opacity-70">{{ chip.count }}</span>
  </button>
</template>
