export interface ImportRow {
  date: string;
  description: string;
  amountCents: number;
  rawCounterparty: string | null;
  mutationType: string | null;
  importHash: string;
}
