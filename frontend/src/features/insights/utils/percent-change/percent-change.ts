/**
 * The change from one value to another, as a whole percentage of the earlier value.
 *
 * @param current - The newer value.
 * @param previous - The earlier value to compare against.
 * @returns The rounded percentage change, or `0` when there is nothing to compare against.
 * @example
 * percentChange(105, 100); // 5
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0)
    return 0;

  return Math.round(((current - previous) / previous) * 100);
}
