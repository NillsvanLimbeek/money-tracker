<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');
</script>

<template>
  <UApp>
    <template v-if="isMobile">
      <h1>You did it!</h1>
      <p>
        Visit <a
          href="https://vuejs.org/"
          target="_blank"
          rel="noopener"
        >vuejs.org</a> to read the
        documentation
      </p>

      <UButton>Click Me!</UButton>
    </template>
    <template v-else>
      <div class="flex h-screen flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 class="text-lg font-semibold">
          Mobile only
        </h1>
        <p class="text-muted">
          This app is designed for mobile devices. Please open it on a smaller screen.
        </p>
      </div>
    </template>
  </UApp>
</template>
