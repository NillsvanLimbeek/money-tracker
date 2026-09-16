<script setup lang="ts">
import { ref } from 'vue';
import CategoryDrawer from '@/components/CategoryDrawer.vue';
import MonthPicker from '@/components/MonthPicker.vue';
import { CATEGORIES } from '@/lib/constants';
import { categoryIsSelected } from '@/lib/utils';

const now = new Date();
const selectedMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1));

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
    <h1 class="text-highlighted text-xl font-bold">
      Transactions
    </h1>
  </div>

  <div class="border-accented flex w-full gap-4 border-b px-4 pb-4">
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

  <MonthPicker v-model="selectedMonth" />
</template>
