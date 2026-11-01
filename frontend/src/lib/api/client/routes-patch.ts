import type { ApiTransaction, CategoryRule, NewCategoryRule } from '@/lib/types';

export interface ApiPatchRoutes {
  [route: `/api/category-rules/${string}`]: {
    body: Partial<NewCategoryRule>;
    response: CategoryRule;
  };
  [route: `/api/transactions/${string}`]: {
    body: { category: string };
    response: ApiTransaction;
  };
}
