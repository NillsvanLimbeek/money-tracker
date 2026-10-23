<script setup lang="ts">
const { title } = defineProps<{ title: string }>();

defineSlots<{
  left?: () => unknown;
  right?: () => unknown;
}>();
</script>

<template>
  <header class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4">
    <div class="flex justify-start">
      <slot name="left" />
    </div>

    <h1 class="text-highlighted text-xl">
      {{ title }}
    </h1>

    <div class="flex justify-end">
      <slot name="right" />
    </div>
  </header>
</template>
