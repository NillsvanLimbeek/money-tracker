import type { ApiGetRoutes } from './routes-get';
import type { ApiPostRoutes } from './routes-post';
import { ofetch } from 'ofetch';

const baseApi = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL,
  credentials: 'include',
});

/**
 * Sends a typed GET request to the API.
 *
 * @param route - A route declared in `ApiGetRoutes`.
 * @param query - The query string params for that route.
 * @returns The parsed response body for that route.
 * @example
 * const hashes = await get('/api/transactions/hashes', { from: '2026-10-01', to: '2026-10-31' });
 */
async function get<T extends keyof ApiGetRoutes>(route: T, query?: ApiGetRoutes[T]['query']): Promise<ApiGetRoutes[T]['response']> {
  const res = await baseApi(route, { method: 'GET', query });

  return res;
}

/**
 * Sends a typed POST request to the API.
 *
 * @param route - A route declared in `ApiPostRoutes`.
 * @param body - The JSON request body for that route.
 * @returns The parsed response body for that route.
 * @example
 * const summary = await post('/api/transactions/import', rows);
 */
async function post<T extends keyof ApiPostRoutes>(route: T, body: ApiPostRoutes[T]['body']): Promise<ApiPostRoutes[T]['response']> {
  const res = await baseApi(route, { method: 'POST', body });

  return res;
}

export { get, post };
