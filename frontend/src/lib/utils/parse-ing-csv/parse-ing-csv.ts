import type { ImportRow } from '../../types';
import { format, isValid, parse } from 'date-fns';
import { m } from '@/paraglide/messages';

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  rows: ImportRow[];
  errors: ParseError[];
}

// ING exports use Dutch or English headers depending on the account's language setting.
const COLUMN_ALIASES = {
  date: ['datum', 'date'],
  description: ['naam / omschrijving', 'name / description'],
  counterparty: ['tegenrekening', 'counterparty'],
  direction: ['af bij', 'debit/credit'],
  amount: ['bedrag (eur)', 'amount (eur)'],
  mutationType: ['mutatiesoort', 'transaction type'],
  notes: ['mededelingen', 'notifications'],
} as const;

const DEBIT = new Set(['af', 'debit']);
const CREDIT = new Set(['bij', 'credit']);

type Column = keyof typeof COLUMN_ALIASES;

const REQUIRED_COLUMNS: Column[] = ['date', 'description', 'direction', 'amount'];

/**
 * Decodes the bytes of an ING export, which is encoded as Windows-1252 rather than UTF-8.
 *
 * @param buffer - The raw file contents.
 * @returns The CSV text, ready for `parseIngCsv`.
 * @example
 * const text = decodeIngCsv(await file.arrayBuffer());
 */
export function decodeIngCsv(buffer: ArrayBuffer): string {
  return new TextDecoder('windows-1252').decode(buffer);
}

// ING exports use `,` or `;` depending on the export; the header line tells which.
function detectDelimiter(headerLine: string): string {
  const commas = headerLine.split(',').length;
  const semicolons = headerLine.split(';').length;
  return semicolons > commas ? ';' : ',';
}

function splitRecords(text: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      }
      else if (char === '"') {
        quoted = false;
      }
      else {
        field += char;
      }
    }
    else if (char === '"') {
      quoted = true;
    }
    else if (char === delimiter) {
      record.push(field);
      field = '';
    }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n')
        i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    }
    else {
      field += char;
    }
  }

  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

function parseDate(value: string): string | null {
  if (!/^\d{8}$/.test(value))
    return null;

  const date = parse(value, 'yyyyMMdd', new Date());
  return isValid(date) ? format(date, 'yyyy-MM-dd') : null;
}

// Integer maths on the digits so `12,50` is exactly 1250, never 1249.9999.
function parseCents(value: string): number | null {
  const match = /^(\d+)(?:,(\d{1,2}))?$/.exec(value.replace(/\./g, ''));
  if (!match)
    return null;

  const [, euros, cents = ''] = match;
  return Number(euros) * 100 + Number(cents.padEnd(2, '0'));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Parses an ING CSV export (Dutch or English headers, `,` or `;` delimited) into import rows.
 * Invalid lines are reported in `errors` and skipped, so one bad line doesn't fail the whole import.
 * Amounts are in cents, negative for debits, and each row gets a stable `importHash` for dedup.
 *
 * @param text - The decoded CSV text, see `decodeIngCsv`.
 * @returns The parsed rows and the errors, with 1-based line numbers where the header is line 1.
 * @example
 * const { rows, errors } = await parseIngCsv(text);
 * // rows[0]: { date: '2026-09-08', description: 'Albert Heijn', amountCents: -1250, ... }
 */
export async function parseIngCsv(text: string): Promise<ParseResult> {
  const content = text.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(content.split(/\r?\n/, 1)[0] ?? '');
  const records = splitRecords(content, delimiter);
  const header = (records.shift() ?? []).map(name => name.trim().toLowerCase());

  const indexOf = (name: Column): number => header.findIndex(title => (COLUMN_ALIASES[name] as readonly string[]).includes(title));
  const missing = REQUIRED_COLUMNS.filter(name => indexOf(name) === -1);
  if (missing.length > 0)
    return { rows: [], errors: [{ line: 1, message: m.csv_missing_columns({ columns: missing.join(', ') }) }] };

  const column = (record: string[], name: Column): string => record[indexOf(name)]?.trim() ?? '';

  const rows: ImportRow[] = [];
  const errors: ParseError[] = [];
  // Two identical purchases on one day (two coffees) must both survive dedup.
  const occurrences = new Map<string, number>();

  for (const [index, record] of records.entries()) {
    const line = index + 2;
    if (record.every(field => field.trim() === ''))
      continue;

    const date = parseDate(column(record, 'date'));
    const cents = parseCents(column(record, 'amount'));
    const direction = column(record, 'direction').toLowerCase();
    const description = column(record, 'description');

    if (!date) {
      errors.push({ line, message: m.csv_invalid_date({ value: column(record, 'date') }) });
    }
    else if (cents === null) {
      errors.push({ line, message: m.csv_invalid_amount({ value: column(record, 'amount') }) });
    }
    else if (!DEBIT.has(direction) && !CREDIT.has(direction)) {
      errors.push({ line, message: m.csv_unknown_direction({ value: column(record, 'direction') }) });
    }
    else if (!description) {
      errors.push({ line, message: m.csv_missing_description() });
    }
    else {
      const amountCents = DEBIT.has(direction) ? -cents : cents;
      const key = `${date}|${amountCents}|${description}`;
      const occurrence = occurrences.get(key) ?? 0;
      occurrences.set(key, occurrence + 1);

      rows.push({
        date,
        description,
        amountCents,
        rawCounterparty: column(record, 'counterparty') || null,
        mutationType: column(record, 'mutationType') || null,
        notes: column(record, 'notes') || null,
        importHash: await sha256(`${key}|${occurrence}`),
      });
    }
  }

  return { rows, errors };
}
