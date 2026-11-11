<script setup lang="ts">
import { m } from '@/paraglide/messages';

interface Props {
  active: 'signin' | 'signup';
}

defineProps<Props>();
</script>

<template>
  <div class="bg-accented grid grid-cols-2 gap-1 rounded-xl p-1">
    <RouterLink
      to="/signin"
      class="rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
      :class="{
        'bg-default text-highlighted shadow-sm': active === 'signin',
        'text-muted': active !== 'signin',
      }"
    >
      {{ m.auth_tab_signin() }}
    </RouterLink>
    <RouterLink
      to="/signup"
      class="rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
      :class="{
        'bg-default text-highlighted shadow-sm': active === 'signup',
        'text-muted': active !== 'signup',
      }"
    >
      {{ m.auth_tab_signup() }}
    </RouterLink>
  </div>
</template>
