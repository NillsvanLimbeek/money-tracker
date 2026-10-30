import type { ApiTransaction, CategoryRule, RuleOperator, RulePreview } from '@/lib/types';

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
  '/api/category-rules/preview': {
    query: { pattern: string; operator: RuleOperator };
    response: RulePreview;
  };
  '/api/transactions/hashes': {
    query: { from: string; to: string };
    response: string[];
  };
}
