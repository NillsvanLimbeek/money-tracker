import { get } from '../fetch';

export async function health(): Promise<string> {
  return await get('/health');
}
