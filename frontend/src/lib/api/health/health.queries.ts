import type { UseQueryReturnType } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import { health } from './health.api';

export function useHealth(): UseQueryReturnType<string, Error> {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => health(),
  });
}
