<script setup lang="ts">
import { m } from '@/paraglide/messages';
</script>

<template v-else>
  <div class="flex h-screen flex-col items-center justify-center gap-2 p-8 text-center">
    <h1 class="text-lg font-semibold">
      {{ m.desktop_blocker_title() }}
    </h1>
    <p class="text-muted">
      {{ m.desktop_blocker_body() }}
    </p>
  </div>
</template>
