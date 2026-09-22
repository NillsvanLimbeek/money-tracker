import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const AUTH_PATHS = ['/signin', '/signup'];

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.restoreSession();

  if (!authStore.user && !AUTH_PATHS.includes(to.path))
    return '/signin';

  if (authStore.user && AUTH_PATHS.includes(to.path))
    return '/';
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
