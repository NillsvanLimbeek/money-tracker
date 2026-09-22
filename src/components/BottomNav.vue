<script setup lang="ts">
import { useRoute } from 'vue-router';
import { NAV_ITEMS } from '@/lib/constants/nav-items';

const route = useRoute();
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
    <div class="border-accented bg-default flex items-center gap-1 rounded-2xl border p-1.5 shadow-lg">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="flex min-w-16 flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors"
        :class="route.path === item.to ? 'bg-brand-100 text-primary' : 'text-muted'"
      >
        <UIcon
          :name="item.icon"
          class="size-5"
        />
        <span class="text-xs font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
