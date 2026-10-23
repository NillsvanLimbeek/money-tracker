/**
 * Checks whether a category is part of the current filter selection.
 *
 * @param selectedCategories - The keys of the selected categories.
 * @param key - The category key to look for.
 * @returns `true` when the key is selected.
 * @example
 * categoryIsSelected(['food', 'rent'], 'rent'); // true
 * categoryIsSelected([], 'food'); // false
 */
export function categoryIsSelected(selectedCategories: string[], key: string): boolean {
  return selectedCategories.includes(key);
}
