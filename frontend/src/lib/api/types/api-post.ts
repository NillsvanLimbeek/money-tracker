import type { ImportRow } from '@/lib/types';

export interface ApiPostRoutes {
  '/api/transactions/import': {
    body: ImportRow[];
    response: { imported: number; skipped: number };
  };
}
