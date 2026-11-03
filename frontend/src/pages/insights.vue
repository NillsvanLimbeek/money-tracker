<script setup lang="ts">
import { m } from '@/paraglide/messages';
</script>

<template>
  <PageHeader :title="m.insights_title()" />

  <div class="text-muted flex flex-col items-center justify-center gap-2 p-4 pt-24 text-center">
    <UIcon
      name="i-lucide-bar-chart-3"
      class="size-10"
    />
    <p class="text-sm">
      {{ m.insights_coming_soon() }}
    </p>
  </div>

  <div class="h-28" />
</template>
