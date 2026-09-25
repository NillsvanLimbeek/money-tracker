<script setup lang="ts">
import type { CSSProperties } from 'vue';

interface Props {
  categoryKey: string;
  label: string;
  showIcon?: boolean;
  selected?: boolean;
}

const { categoryKey, label, showIcon = true, selected = false } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function style(key: string, selected: boolean): CSSProperties {
  if (selected) {
    return {
      backgroundColor: `var(--category-${key}-text)`,
      borderColor: `var(--category-${key}-text)`,
      color: 'var(--ui-text-inverted)',
    };
  }

  return {
    backgroundColor: `var(--category-${key}-bg)`,
    borderColor: `var(--category-${key}-border)`,
    color: `var(--category-${key}-text)`,
  };
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
    :style="style(categoryKey, selected)"
    @click="emit('click')"
  >
    {{ label }}

    <div v-if="showIcon">
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5"
      />
    </div>
  </button>
</template>
