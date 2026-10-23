import { describe, expect, it } from 'vitest';
import { splitNotes } from './split-notes';

describe('splitNotes', () => {
  it('puts each key on its own line', () => {
    expect(splitNotes('Card no: 1234 Date: 30/09/2026 Time: 11:36 Transaction: A1 Term: T9 Google Pay Value date: 30/09/2026')).toEqual([
      'Card no: 1234',
      'Date: 30/09/2026',
      'Time: 11:36',
      'Transaction: A1',
      'Term: T9 Google Pay',
      'Value date: 30/09/2026',
    ]);
  });

  it('splits a direct debit and breaks before the recurrence marker', () => {
    expect(splitNotes('Name: Gym Description: Membership, Period: 1-10 IBAN: NL01 Reference: 42 Mandate ID: 7 Creditor ID: NL02 Recurrent SEPA direct debit')).toEqual([
      'Name: Gym',
      'Description: Membership, Period: 1-10',
      'IBAN: NL01',
      'Reference: 42',
      'Mandate ID: 7',
      'Creditor ID: NL02',
      'Recurrent SEPA direct debit',
    ]);
  });

  it('keeps text without known keys as a single line', () => {
    expect(splitNotes('Salary September')).toEqual(['Salary September']);
    expect(splitNotes('To savings account D1 Value date: 29/09/2026')).toEqual(['To savings account D1', 'Value date: 29/09/2026']);
  });

  it('splits Dutch exports', () => {
    expect(splitNotes('Naam: Spotify Omschrijving: abonnement Kenmerk: 5 Machtiging ID: 9')).toEqual([
      'Naam: Spotify',
      'Omschrijving: abonnement',
      'Kenmerk: 5',
      'Machtiging ID: 9',
    ]);
  });
});
