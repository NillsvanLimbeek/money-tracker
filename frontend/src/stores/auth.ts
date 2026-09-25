import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authClient } from '@/lib/auth-client';

type Status = 'idle' | 'loading' | 'ready';
type SignUpResult = Awaited<ReturnType<typeof authClient.signUp.email>>;
type SignInResult = Awaited<ReturnType<typeof authClient.signIn.email>>;
type SignOutResult = Awaited<ReturnType<typeof authClient.signOut>>;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string; name: string } | null>(null);
  const status = ref<Status>('idle');

  let restoring: Promise<void> | null = null;

  async function restoreSession(): Promise<void> {
    if (restoring)
      return restoring;

    restoring = (async () => {
      status.value = 'loading';

      const { data } = await authClient.getSession();

      user.value = data?.session && data?.user
        ? { id: data.user.id, email: data.user.email, name: data.user.name }
        : null;
      status.value = 'ready';
    })();

    return restoring;
  }

  async function signUp(email: string, password: string, name: string): Promise<SignUpResult> {
    const result = await authClient.signUp.email({ email, password, name });

    if (!result.error)
      await restoreSessionForced();

    return result;
  }

  async function signIn(email: string, password: string, rememberMe = true): Promise<SignInResult> {
    const result = await authClient.signIn.email({ email, password, rememberMe });

    if (!result.error)
      await restoreSessionForced();

    return result;
  }

  async function signOut(): Promise<SignOutResult> {
    const result = await authClient.signOut();

    user.value = null;

    return result;
  }

  async function restoreSessionForced(): Promise<void> {
    restoring = null;

    return restoreSession();
  }

  return { user, status, restoreSession, signUp, signIn, signOut };
});
