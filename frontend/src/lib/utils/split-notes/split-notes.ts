// ING packs the notes into one `Key: value Key: value` string, in English or Dutch depending on the export.
const NOTE_KEYS = [
  'Card no',
  'Date',
  'Time',
  'Transaction',
  'Term',
  'Name',
  'Description',
  'IBAN',
  'Reference',
  'Other party',
  'Mandate ID',
  'Creditor ID',
  'Value date',
  'Pasvolgnr',
  'Transactie',
  'Naam',
  'Omschrijving',
  'Kenmerk',
  'Machtiging ID',
  'Incassant ID',
  'Referentie',
  'Valutadatum',
];

const NOTE_BREAK = new RegExp(`\\s+(?=(?:${NOTE_KEYS.join('|')}):|Recurrent SEPA direct debit)`);

/**
 * Splits the notes ING packs into one string into separate `Key: value` lines. Also breaks before the
 * `Recurrent SEPA direct debit` marker.
 *
 * @param notes - The raw notes (`Mededelingen`) column.
 * @returns The trimmed, non-empty lines.
 * @example
 * splitNotes('Name: Gym IBAN: NL01 Recurrent SEPA direct debit');
 * // ['Name: Gym', 'IBAN: NL01', 'Recurrent SEPA direct debit']
 */
export function splitNotes(notes: string): string[] {
  return notes.split(NOTE_BREAK).map(line => line.trim()).filter(Boolean);
}
