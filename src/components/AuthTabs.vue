<script setup lang="ts">
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
      :class="active === 'signin' ? 'bg-default text-highlighted shadow-sm' : 'text-muted'"
    >
      Sign in
    </RouterLink>
    <RouterLink
      to="/signup"
      class="rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
      :class="active === 'signup' ? 'bg-default text-highlighted shadow-sm' : 'text-muted'"
    >
      Sign up
    </RouterLink>
  </div>
</template>
