import { describe, expect, it } from 'vitest';
import { createRule } from '../category-rule-row/category-rule-row.fixture';
import { isDuplicate } from './is-duplicate';

describe('isDuplicate', () => {
  const rules = [createRule()];

  it('detects the same pattern and operator, ignoring case and spacing', () => {
    expect(isDuplicate(rules, '  Albert   HEIJN ', 'contains')).toBe(true);
  });

  it('is not a duplicate when the operator or pattern differs', () => {
    expect(isDuplicate(rules, 'albert heijn', 'equals')).toBe(false);
    expect(isDuplicate(rules, 'jumbo', 'contains')).toBe(false);
  });

  it('ignores the rule being edited', () => {
    expect(isDuplicate(rules, 'albert heijn', 'contains', 'rule-1')).toBe(false);
  });

  it('still detects a clash with another rule when editing', () => {
    expect(isDuplicate([...rules, createRule({ id: 'rule-2' })], 'albert heijn', 'contains', 'rule-1')).toBe(true);
  });
});
