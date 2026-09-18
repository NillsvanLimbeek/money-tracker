<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const mode = ref<'signin' | 'signup'>('signin');
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const isSubmitting = ref(false);

async function handleSubmit() {
  error.value = '';
  isSubmitting.value = true;

  const result = mode.value === 'signup'
    ? await authStore.signUp(email.value, password.value, name.value)
    : await authStore.signIn(email.value, password.value);

  isSubmitting.value = false;

  if (result.error) {
    error.value = result.error.message ?? 'Something went wrong. Please try again.';
    return;
  }

  router.push('/');
}

function toggleMode() {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin';
  error.value = '';
}
</script>

<template>
  <div class="bg-olive-50 flex h-screen flex-col justify-center gap-6 p-6">
    <h1 class="text-highlighted text-xl font-bold">
      {{ mode === 'signin' ? 'Sign in' : 'Sign up' }}
    </h1>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="handleSubmit"
    >
      <UInput
        v-if="mode === 'signup'"
        v-model="name"
        size="lg"
        placeholder="Name"
        autocomplete="name"
        required
      />

      <UInput
        v-model="email"
        type="email"
        size="lg"
        placeholder="Email"
        autocomplete="email"
        required
      />

      <UInput
        v-model="password"
        type="password"
        size="lg"
        placeholder="Password"
        :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
        required
      />

      <p
        v-if="error"
        class="text-error text-sm"
      >
        {{ error }}
      </p>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isSubmitting"
      >
        {{ mode === 'signin' ? 'Sign in' : 'Sign up' }}
      </UButton>
    </form>

    <p class="text-muted text-center text-sm">
      <template v-if="mode === 'signin'">
        Don't have an account?
        <button
          type="button"
          class="text-primary font-medium"
          @click="toggleMode"
        >
          Sign up
        </button>
      </template>
      <template v-else>
        Already have an account?
        <button
          type="button"
          class="text-primary font-medium"
          @click="toggleMode"
        >
          Sign in
        </button>
      </template>
    </p>
  </div>
</template>
