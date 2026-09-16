<script setup lang="ts">
import { ref } from 'vue';
import CategoryDrawer from '@/components/CategoryDrawer.vue';
import { CATEGORIES } from '@/lib/constants';
import { categoryIsSelected } from '@/lib/utils';

const search = ref('');
const isFilterOpen = ref(false);
const selectedCategories = ref<string[]>([]);

function toggleCategory(key: string) {
  selectedCategories.value = categoryIsSelected(selectedCategories.value, key)
    ? selectedCategories.value.filter(k => k !== key)
    : [...selectedCategories.value, key];
}

function resetCategories() {
  selectedCategories.value = [];
}
</script>

<template>
  <div class="flex items-center justify-between p-4">
    <h1 class="text-xl font-bold text-highlighted">
      Transactions
    </h1>
  </div>

  <div class="w-full flex gap-4 border-b border-accented pb-4 px-4">
    <UInput
      v-model="search"
      class="w-full"
      size="lg"
      icon="i-lucide-search"
      placeholder="Search merchant"
    />

    <CategoryDrawer
      v-model:open="isFilterOpen"
      :categories="CATEGORIES"
      :selected-categories
      @toggle-category="toggleCategory"
      @reset-categories="resetCategories"
    />
  </div>
</template>
