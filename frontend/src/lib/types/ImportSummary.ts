export interface ImportSummary {
  imported: number;
  skipped: number;
  // Newly stored debits that no rule matched.
  uncategorised: number;
}
