import type { CategoryRule, ImportRow, ImportSummary, NewCategoryRule } from '@/lib/types';

export interface ApiPostRoutes {
  '/api/category-rules': {
    body: NewCategoryRule;
    response: CategoryRule;
  };
  [route: `/api/category-rules/${string}/apply`]: {
    body: undefined;
    response: { updated: number };
  };
  '/api/transactions/import': {
    body: ImportRow[];
    response: ImportSummary;
  };
}
