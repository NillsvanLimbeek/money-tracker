import type { ImportRow, ImportSummary } from '@/lib/types';

export interface ApiPostRoutes {
  '/api/transactions/import': {
    body: ImportRow[];
    response: ImportSummary;
  };
}
