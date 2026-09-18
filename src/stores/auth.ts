import { defineStore } from 'pinia';
import { ref } from 'vue';
import { neon } from '@/lib/neon';

type Status = 'idle' | 'loading' | 'ready';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string; name: string } | null>(null);
  const status = ref<Status>('idle');

  let restoring: Promise<void> | null = null;

  async function restoreSession() {
    if (restoring)
      return restoring;

    restoring = (async () => {
      status.value = 'loading';

      const { data } = await neon.auth.getSession();

      user.value = data?.session && data?.user
        ? { id: data.user.id, email: data.user.email, name: data.user.name }
        : null;
      status.value = 'ready';
    })();

    return restoring;
  }

  async function signUp(email: string, password: string, name: string) {
    const result = await neon.auth.signUp.email({ email, password, name });

    if (!result.error)
      await restoreSessionForced();

    return result;
  }

  async function signIn(email: string, password: string) {
    const result = await neon.auth.signIn.email({ email, password });

    if (!result.error)
      await restoreSessionForced();

    return result;
  }

  async function signOut() {
    const result = await neon.auth.signOut();

    user.value = null;

    return result;
  }

  async function restoreSessionForced() {
    restoring = null;

    return restoreSession();
  }

  return { user, status, restoreSession, signUp, signIn, signOut };
});
