import { describe, expect, it } from 'vitest';
import { categoryIsSelected } from './is-selected';

describe('categoryIsSelected', () => {
  it('is true when the key is selected', () => {
    expect(categoryIsSelected(['food', 'rent'], 'rent')).toBe(true);
  });

  it('is false when the key is not selected', () => {
    expect(categoryIsSelected(['food'], 'rent')).toBe(false);
  });

  it('is false for an empty selection', () => {
    expect(categoryIsSelected([], 'food')).toBe(false);
  });
});
