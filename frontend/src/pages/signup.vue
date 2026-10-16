<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { SignUp } from '@/lib/models/sign-up';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SIGN_UP_FIELDS } from '@/lib/constants';
import { SignUpSchema } from '@/lib/models/sign-up';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const state = reactive<SignUp>({
  name: '',
  email: '',
  password: '',
  agreedToTerms: false,
});

const error = ref('');
const isSubmitting = ref(false);

async function onSubmit(event: FormSubmitEvent<SignUp>): Promise<void> {
  error.value = '';
  isSubmitting.value = true;

  const result = await authStore.signUp(event.data.email, event.data.password, event.data.name);

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
    <div>
      <h1 class="text-highlighted flex justify-center text-2xl font-bold">
        Sign Up
      </h1>
    </div>

    <AuthTabs active="signup" />

    <UForm
      :schema="SignUpSchema"
      :state="state"
      class="flex flex-col gap-4"
      @submit="onSubmit"
    >
      <AuthFormField
        v-for="field in SIGN_UP_FIELDS"
        :key="field.name"
        v-model="state[field.name]"
        :field="field"
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
        size="xl"
        color="neutral"
        :loading="isSubmitting"
      >
        Sign Up
      </UButton>
    </UForm>

    <p class="text-muted mt-auto pb-2 text-center text-sm">
      Already a account?
      <RouterLink
        to="/signin"
        class="text-primary font-medium"
      >
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
