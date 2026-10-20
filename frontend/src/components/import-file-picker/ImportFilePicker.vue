<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core';
import { ref } from 'vue';
import { MAX_FILE_BYTES, SUPPORTED_BANKS } from '@/lib/constants';

const emit = defineEmits<{
  (e: 'select', file: File): void;
}>();

const dropZone = ref<HTMLElement>();
const maxSizeLabel = `${MAX_FILE_BYTES / 1024 / 1024} MB`;

const { open, onChange } = useFileDialog({ accept: '.csv,text/csv', multiple: false, reset: true });
onChange((files) => {
  if (files?.[0])
    emit('select', files[0]);
});

const { isOverDropZone } = useDropZone(dropZone, {
  multiple: false,
  onDrop: (files) => {
    if (files?.[0])
      emit('select', files[0]);
  },
});

async function useSample(): Promise<void> {
  const response = await fetch('/sample-ing.csv');
  emit('select', new File([await response.blob()], 'sample-ing.csv', { type: 'text/csv' }));
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-col gap-6 p-4">
      <button
        ref="dropZone"
        type="button"
        class="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-4 transition-colors"
        :class="isOverDropZone ? 'border-primary bg-primary/5' : 'border-accented bg-default'"
        @click="open()"
      >
        <span class="border-muted text-muted flex h-20 w-16 items-end justify-center rounded-xl border-2 pb-2 font-mono text-xs font-bold">
          CSV
        </span>
        <span class="flex flex-col items-center gap-1">
          <span class="text-highlighted text-xl font-semibold">Choose a CSV file</span>
          <span class="text-muted font-mono text-sm">or drop it here · max {{ maxSizeLabel }}</span>
        </span>
      </button>

      <div class="flex flex-col gap-3">
        <span class="text-muted font-mono text-xs tracking-wide uppercase">Recognised formats</span>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="bank in SUPPORTED_BANKS"
            :key="bank"
            class="border-accented bg-default text-highlighted rounded-full border px-4 py-2 text-sm font-medium"
          >
            {{ bank }}
          </li>
        </ul>
      </div>
    </div>

    <div class="border-accented bg-olive-50 sticky bottom-0 flex flex-col items-center gap-2 border-t p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <UButton
        block
        size="xl"
        color="neutral"
        class="justify-center rounded-2xl py-4"
        @click="open()"
      >
        Choose file
      </UButton>
      <UButton
        variant="link"
        @click="useSample"
      >
        Try with a sample file
      </UButton>
    </div>
  </div>
</template>
