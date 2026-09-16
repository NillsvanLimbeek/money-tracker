<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');
</script>

<template>
  <UApp>
    <template v-if="isMobile">
      <div class="bg-olive-50 h-screen">
        <RouterView />
      </div>
    </template>

    <template v-else>
      <DesktopBlocker />
    </template>
  </UApp>
</template>
