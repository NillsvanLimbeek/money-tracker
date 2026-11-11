<script setup lang="ts">
import { m } from '@/paraglide/messages';

defineProps<{ suggestPending?: boolean }>();

const emit = defineEmits<{ (e: 'add' | 'suggest'): void }>();
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 pt-32 text-center">
    <div class="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
      <UIcon
        name="i-lucide-filter"
        class="text-primary size-6"
      />
    </div>

    <h2 class="text-highlighted text-lg font-semibold">
      {{ m.rules_empty_title() }}
    </h2>

    <p class="text-muted max-w-xs">
      {{ m.rules_empty_body() }}
    </p>

    <UButton
      block
      size="xl"
      class="justify-center rounded-2xl py-4"
      @click="emit('add')"
    >
      {{ m.rules_empty_add() }}
    </UButton>

    <UButton
      block
      size="xl"
      variant="soft"
      icon="i-lucide-sparkles"
      class="justify-center rounded-2xl py-4"
      :loading="suggestPending"
      @click="emit('suggest')"
    >
      {{ m.rules_empty_suggested() }}
    </UButton>
  </div>
</template>
