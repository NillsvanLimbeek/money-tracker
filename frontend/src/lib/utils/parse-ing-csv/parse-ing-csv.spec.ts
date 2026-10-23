import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodeIngCsv, parseIngCsv } from './parse-ing-csv';

const HEADER = '"Datum","Naam / Omschrijving","Rekening","Tegenrekening","Code","Af Bij","Bedrag (EUR)","Mutatiesoort","Mededelingen"';

function csv(...lines: string[]): string {
  return [HEADER, ...lines].join('\n');
}

describe('parseIngCsv', () => {
  it('parses a debit as a negative amount in cents', async () => {
    const { rows, errors } = await parseIngCsv(csv('"20260908","Albert Heijn","NL01INGB0000000001","","BA","Af","12,50","Betaalautomaat","Pas 123"'));

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: '2026-09-08',
      description: 'Albert Heijn',
      amountCents: -1250,
      rawCounterparty: null,
      mutationType: 'Betaalautomaat',
    });
  });

  it('parses a credit as a positive amount', async () => {
    const { rows } = await parseIngCsv(csv('"20260901","Werkgever BV","NL01INGB0000000001","NL02ABNA0123456789","OV","Bij","3400,00","Overschrijving",""'));

    expect(rows[0]?.amountCents).toBe(340000);
    expect(rows[0]?.rawCounterparty).toBe('NL02ABNA0123456789');
  });

  it('converts comma decimals without float drift', async () => {
    const { rows } = await parseIngCsv(csv(
      '"20260901","A","","","BA","Af","0,10","",""',
      '"20260901","B","","","BA","Af","1.234,5","",""',
      '"20260901","C","","","BA","Af","7","",""',
    ));

    expect(rows.map(row => row.amountCents)).toEqual([-10, -123450, -700]);
  });

  it('supports semicolon-delimited exports, a BOM and CRLF', async () => {
    const text = `\uFEFF${HEADER.replaceAll(',', ';')}\r\n"20260908";"Spotify";"";"";"BA";"Af";"11,99";"Online";""\r\n`;
    const { rows, errors } = await parseIngCsv(text);

    expect(errors).toEqual([]);
    expect(rows[0]).toMatchObject({ description: 'Spotify', amountCents: -1199 });
  });

  it('parses the English export format', async () => {
    const text = [
      '"Date";"Name / Description";"Account";"Counterparty";"Code";"Debit/credit";"Amount (EUR)";"Transaction type";"Notifications";"Resulting balance";"Tag"',
      '"20260930";"Albert Heijn 2272 VOLENDAM NLD";"NL01INGB0000000001";"";"BA";"Debit";"9,01";"Payment terminal";"Card no: 1234";"573,28";""',
      '"20260925";"Employer B.V.";"NL01INGB0000000001";"NL02ABNA0123456789";"OV";"Credit";"3341,26";"Transfer";"Salary";"3365,68";""',
    ].join('\n');
    const { rows, errors } = await parseIngCsv(text);

    expect(errors).toEqual([]);
    expect(rows.map(row => row.amountCents)).toEqual([-901, 334126]);
    expect(rows[0]).toMatchObject({ date: '2026-09-30', rawCounterparty: null, mutationType: 'Payment terminal' });
    expect(rows[1]?.rawCounterparty).toBe('NL02ABNA0123456789');
    expect(rows.map(row => row.notes)).toEqual(['Card no: 1234', 'Salary']);
  });

  it('reads the notes column and leaves it null when empty', async () => {
    const { rows } = await parseIngCsv(csv(
      '"20260908","A","","","BA","Af","1,00","","Pas 123"',
      '"20260908","B","","","BA","Af","1,00","",""',
    ));

    expect(rows.map(row => row.notes)).toEqual(['Pas 123', null]);
  });

  it('keeps commas and newlines inside quoted fields', async () => {
    const { rows } = await parseIngCsv(csv('"20260908","Bakker, de","","","BA","Af","3,00","","regel 1\nregel 2"'));

    expect(rows[0]?.description).toBe('Bakker, de');
  });

  it('gives identical rows within one file distinct hashes, stable across parses', async () => {
    const line = '"20260908","Koffie","","","BA","Af","2,50","",""';
    const first = await parseIngCsv(csv(line, line));
    const second = await parseIngCsv(csv(line, line));

    expect(first.rows[0]?.importHash).not.toBe(first.rows[1]?.importHash);
    expect(first.rows.map(row => row.importHash)).toEqual(second.rows.map(row => row.importHash));
  });

  it('reports bad rows with their line number and keeps the good ones', async () => {
    const { rows, errors } = await parseIngCsv(csv(
      '"20260230","Bad date","","","BA","Af","1,00","",""',
      '"20260908","Good","","","BA","Af","1,00","",""',
      '"20260908","Bad amount","","","BA","Af","abc","",""',
      '"20260908","Bad direction","","","BA","??","1,00","",""',
    ));

    expect(rows).toHaveLength(1);
    expect(errors.map(error => error.line)).toEqual([2, 4, 5]);
  });

  it('rejects a file without the expected columns', async () => {
    const { rows, errors } = await parseIngCsv('a,b,c\n1,2,3');

    expect(rows).toEqual([]);
    expect(errors[0]?.message).toContain('Missing columns');
  });
});

describe('decodeIngCsv', () => {
  it('decodes Windows-1252 bytes', () => {
    const bytes = new Uint8Array([0x43, 0x61, 0x66, 0xE9]);

    expect(decodeIngCsv(bytes.buffer)).toBe('Café');
  });
});

describe('sample file', () => {
  it('parses cleanly, including the two identical purchases', async () => {
    const buffer = readFileSync('public/sample-ing.csv');
    const { rows, errors } = await parseIngCsv(decodeIngCsv(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer));

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(12);
    expect(new Set(rows.map(row => row.importHash)).size).toBe(12);
  });
});
