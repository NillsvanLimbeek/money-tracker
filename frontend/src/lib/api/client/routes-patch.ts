import type { ApiTransaction } from '@/lib/types';

export interface ApiPatchRoutes {
  [route: `/api/transactions/${string}`]: {
    body: { category: string };
    response: ApiTransaction;
  };
}
