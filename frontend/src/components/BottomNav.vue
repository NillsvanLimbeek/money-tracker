<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { NAV_ITEMS } from '@/lib/constants/nav-items';

const route = useRoute();
const showImport = computed(() => route.path === '/');
const isActive = (to: string): boolean => route.path === to;
</script>

<template>
  <nav class="border-accented bg-default fixed inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)] shadow-lg">
    <RouterLink
      v-if="showImport"
      to="/import"
      aria-label="Import transactions"
      class="bg-inverted text-inverted absolute top-0 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 shadow-md"
    >
      <UIcon
        name="i-lucide-plus"
        class="size-6"
      />
    </RouterLink>

    <div class="flex items-center justify-around px-4 py-4">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        :aria-label="item.label"
        class="flex flex-col items-center gap-1.5 p-2 transition-colors"
        :class="{ 'text-primary': isActive(item.to), 'text-muted': !isActive(item.to) }"
      >
        <UIcon
          :name="item.icon"
          class="size-6"
        />
        <span
          class="size-1 rounded-full"
          :class="{ 'bg-primary': isActive(item.to), 'bg-transparent': !isActive(item.to) }"
        />
      </RouterLink>
    </div>
  </nav>
</template>
