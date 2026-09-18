import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.restoreSession();

  if (!authStore.user && to.path !== '/signin')
    return '/signin';

  if (authStore.user && to.path === '/signin')
    return '/';
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
