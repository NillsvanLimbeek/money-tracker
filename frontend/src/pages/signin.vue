<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { SignIn } from '@/lib/models/sign-in';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SIGN_IN_FIELDS } from '@/lib/constants';
import { SignInSchema } from '@/lib/models/sign-in';
import { m } from '@/paraglide/messages';
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
    error.value = result.error.message ?? m.common_error_generic();
    return;
  }

  router.push('/');
}
</script>

<template>
  <div class="bg-olive-50 flex min-h-screen flex-col gap-6 overflow-y-auto p-6">
    <h1 class="text-highlighted flex justify-center text-2xl font-bold">
      {{ m.signin_title() }}
    </h1>

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
          :label="m.signin_remember()"
        />
        <button
          type="button"
          class="text-primary text-sm font-medium"
        >
          {{ m.signin_forgot() }}
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
        {{ m.signin_submit() }}
      </UButton>
    </UForm>

    <p class="text-muted mt-auto pb-2 text-center text-sm">
      {{ m.signin_no_ledger() }}
      <RouterLink
        to="/signup"
        class="text-primary font-medium"
      >
        {{ m.signin_create_one() }}
      </RouterLink>
    </p>
  </div>
</template>
