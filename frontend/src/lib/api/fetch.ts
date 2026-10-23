import type { ApiGetRoutes } from './types/api-get';
import type { ApiPostRoutes } from './types/api-post';
import { ofetch } from 'ofetch';

const baseApi = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL,
  credentials: 'include',
});

async function get<T extends keyof ApiGetRoutes>(route: T, query?: ApiGetRoutes[T]['query']): Promise<ApiGetRoutes[T]['response']> {
  const res = await baseApi(route, { method: 'GET', query });

  return res;
}

async function post<T extends keyof ApiPostRoutes>(route: T, body: ApiPostRoutes[T]['body']): Promise<ApiPostRoutes[T]['response']> {
  const res = await baseApi(route, { method: 'POST', body });

  return res;
}

export { get, post };
