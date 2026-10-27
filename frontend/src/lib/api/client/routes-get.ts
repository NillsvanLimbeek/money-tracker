import type { ApiTransaction } from '@/lib/types';

export interface ApiGetRoutes {
  '/health': {
    query?: undefined;
    response: string;
  };
  '/api/transactions': {
    query: { month?: string };
    response: ApiTransaction[];
  };
  '/api/transactions/hashes': {
    query: { from: string; to: string };
    response: string[];
  };
}
