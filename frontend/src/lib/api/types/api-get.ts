export interface ApiGetRoutes {
  '/health': {
    query?: undefined;
    response: string;
  };
  '/api/transactions/hashes': {
    query: { from: string; to: string };
    response: string[];
  };
}
