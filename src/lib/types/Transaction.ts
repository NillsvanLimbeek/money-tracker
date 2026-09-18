export interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  categoryKey: string;
}
