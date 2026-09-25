import { ofetch } from 'ofetch';

interface ApiGetResponse {
  '/health': string;
}

const baseApi = ofetch.create({
  baseURL: 'http://localhost:8788',
});

async function get<T extends keyof ApiGetResponse>(route: T): Promise<ApiGetResponse[T]> {
  const res = await baseApi(route, { method: 'GET' });

  return res;
}

export { get };
