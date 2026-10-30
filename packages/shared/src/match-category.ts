export type RuleOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';

export interface MatchableRule {
  pattern: string;
  operator: RuleOperator;
  createdAt: Date;
}

// How specific an operator is when overlapping rules compete.
const OPERATOR_STRENGTH: Record<RuleOperator, number> = {
  equals: 3,
  startsWith: 2,
  endsWith: 2,
  contains: 1,
};

/**
 * Lowercases, trims and collapses whitespace so matching ignores case and spacing.
 *
 * @param value - A description or rule pattern.
 * @returns The normalised text.
 * @example
 * normalise('  Albert  HEIJN '); // 'albert heijn'
 */
export function normalise(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Checks whether one rule matches a description.
 *
 * @param description - The transaction description.
 * @param rule - The rule to test. An empty pattern never matches.
 * @returns True if the rule's operator holds between the description and its pattern.
 * @example
 * ruleMatches('Albert Heijn 1234', { pattern: 'albert heijn', operator: 'startsWith', createdAt: new Date() }); // true
 */
export function ruleMatches(description: string, rule: Pick<MatchableRule, 'pattern' | 'operator'>): boolean {
  const text = normalise(description);
  const pattern = normalise(rule.pattern);

  if (pattern === '')
    return false;

  switch (rule.operator) {
    case 'equals':
      return text === pattern;
    case 'startsWith':
      return text.startsWith(pattern);
    case 'endsWith':
      return text.endsWith(pattern);
    case 'contains':
      return text.includes(pattern);
  }
}

/**
 * Finds the rule that wins for a description. Overlaps resolve to the most specific rule:
 * operator strength (equals > starts/ends > contains), then the longer pattern, then the older rule.
 *
 * @param description - The transaction description.
 * @param rules - All of the user's rules.
 * @returns The winning rule, or null if none match.
 * @example
 * const rule = findWinningRule('Albert Heijn 1234', rules);
 */
export function findWinningRule<T extends MatchableRule>(description: string, rules: T[]): T | null {
  let winner: T | null = null;

  for (const rule of rules) {
    if (ruleMatches(description, rule) && (!winner || isMoreSpecific(rule, winner)))
      winner = rule;
  }

  return winner;
}

function isMoreSpecific(a: MatchableRule, b: MatchableRule): boolean {
  const strength = OPERATOR_STRENGTH[a.operator] - OPERATOR_STRENGTH[b.operator];
  if (strength !== 0)
    return strength > 0;

  const length = normalise(a.pattern).length - normalise(b.pattern).length;
  if (length !== 0)
    return length > 0;

  return a.createdAt.getTime() < b.createdAt.getTime();
}

/**
 * Returns the category of the winning rule for a description.
 *
 * @param description - The transaction description.
 * @param rules - All of the user's rules.
 * @returns The winning rule's category key, or null if no rule matches.
 * @example
 * matchCategory('Albert Heijn 1234', rules); // 'food'
 */
export function matchCategory(description: string, rules: (MatchableRule & { category: string })[]): string | null {
  return findWinningRule(description, rules)?.category ?? null;
}
