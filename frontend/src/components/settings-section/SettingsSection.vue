<script setup lang="ts">
const { title } = defineProps<{ title: string }>();

defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <section class="flex flex-col gap-2">
    <h2 class="text-muted px-2 pb-1 font-mono text-xs tracking-wide uppercase">
      {{ title }}
    </h2>

    <div class="border-accented bg-default divide-accented flex flex-col divide-y overflow-hidden rounded-2xl border shadow-sm">
      <slot />
    </div>
  </section>
</template>
