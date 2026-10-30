import type { ApiTransaction, CategoryRule } from '@/lib/types';

export interface ApiGetRoutes {
  '/health': {
    query?: undefined;
    response: string;
  };
  '/api/transactions': {
    query: { month?: string };
    response: ApiTransaction[];
  };
  '/api/category-rules': {
    query?: undefined;
    response: CategoryRule[];
  };
  '/api/transactions/hashes': {
    query: { from: string; to: string };
    response: string[];
  };
}
