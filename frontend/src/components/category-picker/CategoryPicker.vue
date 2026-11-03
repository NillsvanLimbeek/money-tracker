<script setup lang="ts">
import type { Category } from '@/lib/types';
import { m } from '@/paraglide/messages';

interface Props {
  categories: Category[];
  selectedKey: string;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', key: string): void;
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="bg-elevated border-accented rounded-xl border p-3">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-muted font-mono text-xs tracking-wide uppercase">{{ m.category_picker_title() }}</span>

      <button
        type="button"
        class="text-muted hover:text-toned"
        :aria-label="m.common_close()"
        @click="emit('close')"
      >
        <UIcon
          name="i-lucide-x"
          class="size-4"
        />
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <CategoryBadge
        v-for="category in categories"
        :key="category.key"
        :label="category.label"
        :category-key="category.key"
        :show-icon="false"
        :selected="category.key === selectedKey"
        @click="emit('select', category.key)"
      />
    </div>
  </div>
</template>
