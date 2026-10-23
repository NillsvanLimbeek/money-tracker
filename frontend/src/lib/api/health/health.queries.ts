import type { UseQueryReturnType } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import { health } from './health.api';

/**
 * Query for the API health status.
 *
 * @returns The TanStack query result for the health check.
 * @example
 * const { data, isLoading } = useHealth();
 */
export function useHealth(): UseQueryReturnType<string, Error> {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => health(),
  });
}
