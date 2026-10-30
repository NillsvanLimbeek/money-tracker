<script setup lang="ts">
const emit = defineEmits<{ (e: 'add'): void }>();
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
      No rules yet
    </h2>

    <p class="text-muted max-w-xs">
      Rules sort imports for you. Start with a merchant you see every month.
    </p>

    <UButton
      block
      size="xl"
      class="justify-center rounded-2xl py-4"
      @click="emit('add')"
    >
      Add your first rule
    </UButton>
  </div>
</template>
