import type { CategoryRule } from '../../types';
import { describe, expect, it } from 'vitest';
import { validateRule } from './validate-rule';

const CATEGORIES = [{ key: 'housing', label: 'Housing' }, { key: 'food', label: 'Food' }];
const RULES: CategoryRule[] = [{ id: 'r1', pattern: 'Ziggo', operator: 'contains', categoryKey: 'housing', matches: 3 }];

describe('validateRule', () => {
  it('blocks an empty pattern', () => {
    expect(validateRule({ pattern: '   ', operator: 'contains' }, RULES, CATEGORIES)).toEqual({
      level: 'error',
      message: 'Enter a pattern to match.',
      canSave: false,
    });
  });

  it('blocks a duplicate pattern and operator, naming the existing rule', () => {
    expect(validateRule({ pattern: ' ZIGGO ', operator: 'contains' }, RULES, CATEGORIES)).toEqual({
      level: 'error',
      message: 'This rule already exists: contains “Ziggo” → Housing.',
      canSave: false,
    });
  });

  it('does not count the rule being edited as its own duplicate', () => {
    expect(validateRule({ pattern: 'ziggo', operator: 'contains' }, RULES, CATEGORIES, undefined, 'r1').canSave).toBe(true);
  });

  it('allows the same pattern with another operator', () => {
    expect(validateRule({ pattern: 'ziggo', operator: 'equals' }, RULES, CATEGORIES).canSave).toBe(true);
  });

  it('warns about a very short pattern but still allows saving', () => {
    expect(validateRule({ pattern: 'ah', operator: 'contains' }, RULES, CATEGORIES, 4)).toEqual({
      level: 'warning',
      message: 'Very short pattern — “ah” matches 4 different descriptions. Make it more specific.',
      canSave: true,
    });
  });

  it('words the warning without a count while the preview loads', () => {
    expect(validateRule({ pattern: 'ah', operator: 'contains' }, RULES, CATEGORIES).message)
      .toBe('Very short pattern — “ah” matches many different descriptions. Make it more specific.');
  });

  it('uses the singular for one description', () => {
    expect(validateRule({ pattern: 'ah', operator: 'contains' }, RULES, CATEGORIES, 1).message).toContain('1 different description.');
  });

  it('accepts a specific pattern', () => {
    expect(validateRule({ pattern: 'albert heijn', operator: 'contains' }, RULES, CATEGORIES)).toEqual({ level: null, message: null, canSave: true });
  });
});
