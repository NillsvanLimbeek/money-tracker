import { get } from '../client/fetch';

/**
 * Pings the API health endpoint.
 *
 * @returns The health status string returned by the server.
 * @example
 * const status = await health();
 */
export async function health(): Promise<string> {
  return await get('/health');
}
