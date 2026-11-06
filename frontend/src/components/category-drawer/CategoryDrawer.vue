<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { Category } from '@/lib/types';
import { categoryIsSelected } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  categories: Category[];
  selectedCategories: string[];
}

const { selectedCategories } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'resetCategories'): void;
  (e: 'toggleCategory', payload: string): void;
}>();

const isFilterOpen = defineModel<boolean>('open', { required: true });

function categoryStyle(key: string): CSSProperties {
  if (categoryIsSelected(selectedCategories, key)) {
    return {
      backgroundColor: `var(--category-${key}-text)`,
      borderColor: `var(--category-${key}-text)`,
      color: 'var(--ui-text-inverted)',
    };
  }

  return {
    backgroundColor: 'var(--ui-bg)',
    borderColor: `var(--category-${key}-border)`,
    color: `var(--category-${key}-text)`,
  };
}
</script>

<template>
  <UDrawer
    v-model:open="isFilterOpen"
    :ui="{ overlay: 'bg-black/50' }"
  >
    <UButton
      :color="selectedCategories.length > 0 ? 'primary' : 'neutral'"
      :variant="selectedCategories.length > 0 ? 'soft' : 'outline'"
      icon="i-lucide-list-sort-descending"
      size="lg"
      class="shrink-0 whitespace-nowrap"
    >
      {{ m.filter_count({ count: selectedCategories.length }) }}
    </UButton>

    <template #header>
      <h2 class="text-highlighted flex-1 text-lg font-semibold">
        {{ m.filter_title() }}
      </h2>

      <UButton
        variant="link"
        color="primary"
        class="p-0"
        @click="emit('resetCategories')"
      >
        {{ m.filter_reset() }}
      </UButton>
    </template>

    <template #body>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="category in categories"
          :key="category.key"
          type="button"
          class="rounded-full border px-3 py-2 text-sm font-medium transition-colors"
          :style="categoryStyle(category.key)"
          @click="() => emit('toggleCategory', category.key)"
        >
          {{ category.label }}
        </button>
      </div>
    </template>

    <template #footer>
      <UButton
        block
        color="neutral"
        variant="solid"
        size="lg"
        @click="isFilterOpen = false"
      >
        {{ m.filter_show_items() }}
      </UButton>
    </template>
  </UDrawer>
</template>
