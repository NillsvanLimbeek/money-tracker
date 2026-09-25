<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { SignIn } from '@/lib/models/sign-in';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SIGN_IN_FIELDS } from '@/lib/constants';
import { SignInSchema } from '@/lib/models/sign-in';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const state = reactive<SignIn>({
  email: '',
  password: '',
});

const rememberMe = ref(true);
const error = ref('');
const isSubmitting = ref(false);

async function onSubmit(event: FormSubmitEvent<SignIn>): Promise<void> {
  error.value = '';
  isSubmitting.value = true;

  const result = await authStore.signIn(event.data.email, event.data.password, rememberMe.value);

  isSubmitting.value = false;

  if (result.error) {
    error.value = result.error.message ?? 'Something went wrong. Please try again.';
    return;
  }

  router.push('/');
}
</script>

<template>
  <div class="bg-olive-50 flex min-h-screen flex-col gap-6 overflow-y-auto p-6">
    <div class="flex items-center gap-3">
      <div class="bg-primary text-inverted flex size-10 items-center justify-center rounded-xl text-lg font-bold">
        K
      </div>
      <span class="text-highlighted text-lg font-bold">Kasboek</span>
    </div>

    <div>
      <h1 class="text-highlighted text-2xl font-bold">
        Welcome back
      </h1>
      <p class="text-muted mt-2 text-sm">
        Sign in to pick up where you left off.
      </p>
    </div>

    <AuthTabs active="signin" />

    <UForm
      :schema="SignInSchema"
      :state="state"
      class="flex flex-col gap-4"
      @submit="onSubmit"
    >
      <AuthFormField
        v-for="field in SIGN_IN_FIELDS"
        :key="field.name"
        v-model="state[field.name]"
        :field="field"
      />

      <div class="flex items-center justify-between">
        <UCheckbox
          v-model="rememberMe"
          label="Keep me signed in on this device"
        />
        <button
          type="button"
          class="text-primary text-sm font-medium"
        >
          Forgot?
        </button>
      </div>

      <p
        v-if="error"
        class="text-error text-sm"
      >
        {{ error }}
      </p>

      <UButton
        type="submit"
        block
        size="xl"
        color="neutral"
        :loading="isSubmitting"
      >
        Sign in
      </UButton>
    </UForm>

    <p class="text-muted mt-auto pb-2 text-center text-sm">
      No ledger yet?
      <RouterLink
        to="/signup"
        class="text-primary font-medium"
      >
        Create one
      </RouterLink>
    </p>
  </div>
</template>
