import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb, seedTransaction, seedUser } from '../../test/d1';
import { previewRuleMatches } from './preview-rule-matches';

describe('previewRuleMatches', () => {
  beforeEach(async () => {
    await resetDb();
    await seedUser('alice');
    await seedUser('bob');
  });

  it('groups matching transactions by description, most frequent first', async () => {
    await seedTransaction({ id: 't1', userId: 'alice', description: 'Albert Heijn 1', date: '2026-10-01', amountCents: -100 });
    await seedTransaction({ id: 't2', userId: 'alice', description: 'albert  heijn 1', date: '2026-10-05', amountCents: -250 });
    await seedTransaction({ id: 't3', userId: 'alice', description: 'Albert Heijn 2', date: '2026-10-02', amountCents: -400 });
    await seedTransaction({ id: 't4', userId: 'alice', description: 'Netflix' });

    const groups = await previewRuleMatches(db, 'alice', { pattern: 'albert', operator: 'contains' });

    expect(groups).toEqual([
      { description: 'albert  heijn 1', count: 2, date: '2026-10-05', amountCents: -250 },
      { description: 'Albert Heijn 2', count: 1, date: '2026-10-02', amountCents: -400 },
    ]);
  });

  it('ignores other users\' transactions', async () => {
    await seedTransaction({ id: 't1', userId: 'bob', description: 'Albert Heijn 1' });

    expect(await previewRuleMatches(db, 'alice', { pattern: 'albert', operator: 'contains' })).toEqual([]);
  });

  it('matches nothing for an empty pattern', async () => {
    await seedTransaction({ id: 't1', userId: 'alice' });

    expect(await previewRuleMatches(db, 'alice', { pattern: ' ', operator: 'contains' })).toEqual([]);
  });
});
