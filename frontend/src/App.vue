<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BottomNav from '@/components/bottom-nav/BottomNav.vue';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');

const route = useRoute();
const AUTH_PATHS = ['/signin', '/signup'];
// The import flow has its own footer actions.
const HIDDEN_NAV_PATHS = [...AUTH_PATHS, '/import'];
const showBottomNav = computed(() => !HIDDEN_NAV_PATHS.includes(route.path));
</script>

<template>
  <UApp>
    <template v-if="isMobile">
      <div class="bg-olive-50 h-screen">
        <RouterView />
        <BottomNav v-if="showBottomNav" />
      </div>
    </template>

    <template v-else>
      <DesktopBlocker />
    </template>
  </UApp>
</template>
