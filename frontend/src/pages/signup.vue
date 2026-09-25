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
    <div class="flex items-center gap-3">
      <div class="bg-primary text-inverted flex size-10 items-center justify-center rounded-xl text-lg font-bold">
        K
      </div>
      <span class="text-highlighted text-lg font-bold">Kasboek</span>
    </div>

    <div>
      <h1 class="text-highlighted text-2xl font-bold">
        Start your ledger
      </h1>
      <p class="text-muted mt-2 text-sm">
        One private ledger for your own money. No accounts linked until you say so.
      </p>
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
        Create ledger
      </UButton>
    </UForm>

    <p class="text-muted mt-auto pb-2 text-center text-sm">
      Already keeping a ledger?
      <RouterLink
        to="/signin"
        class="text-primary font-medium"
      >
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
