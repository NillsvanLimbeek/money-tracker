<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { Category } from '@/lib/types';
import { CATEGORY_ICONS } from '@/lib/constants';

interface Props {
  categories: Category[];
}

defineProps<Props>();

const selectedKey = defineModel<string | null>({ required: true });

function categoryStyle(key: string, selected: boolean): CSSProperties {
  return {
    backgroundColor: selected ? `var(--category-${key}-bg)` : 'var(--ui-bg)',
    borderColor: selected ? `var(--category-${key}-text)` : 'var(--ui-border-accented)',
  };
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="category in categories"
      :key="category.key"
      type="button"
      class="text-highlighted flex items-center gap-3 rounded-xl border p-2 font-medium"
      :style="categoryStyle(category.key, selectedKey === category.key)"
      :aria-pressed="selectedKey === category.key"
      @click="selectedKey = category.key"
    >
      <span
        class="flex size-8 items-center justify-center rounded-lg"
        :style="{ backgroundColor: `var(--category-${category.key}-bg)`, color: `var(--category-${category.key}-text)` }"
      >
        <UIcon
          :name="CATEGORY_ICONS[category.key] ?? 'i-lucide-tag'"
          class="size-4"
        />
      </span>

      {{ category.label }}

      <UIcon
        v-if="selectedKey === category.key"
        name="i-lucide-check"
        class="ml-auto size-4"
      />
    </button>
  </div>
</template>
