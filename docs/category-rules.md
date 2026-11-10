# Category Rules — Spec (draft)

> Status: draft for review. Elaborates point 1 of "Next up" in `context/project-overview.md`.

## Goal

The user defines rules that assign a category to transactions, e.g. _description contains "Albert Heijn" → Food_. Rules run on import and can be applied to existing transactions. A manual category change always wins over a rule.

## Decisions so far

| Topic | Decision |
|---|---|
| Categories | Fixed list for now (`CATEGORIES`). User-defined categories are a later stage |
| Matching | Simple operator dropdown, no regex |
| Operators | `contains`, `equals`, `starts with`, `ends with` — all case-insensitive |
| Match field | Description only (for now) |
| Rule creation | Prompt after a manual category change ("Always categorise 'X' as Food?"); a form on the settings page is also needed |
| Ordering | No manual order, no priority column — the most specific rule wins automatically (see below) |

## Rule model

Changes to `category_rules`:

| Column | Notes |
|---|---|
| `id` | uuid |
| `userId` | FK to `user.id`, cascade delete |
| `pattern` | Replaces `keyword`. Stored trimmed; compared case-insensitively |
| `operator` | `contains` \| `equals` \| `startsWith` \| `endsWith` |
| `category` | Category **key** (`food`, not `Food`) |
| `createdAt` | Tie-break, oldest wins |
| ~~`priority`~~ | Dropped |

Changes to `transactions`:

| Column | Notes |
|---|---|
| `categorySource` | `rule` \| `manual` \| `default`. Lets "apply rules" skip manual overrides |

The existing import placeholder writes `Income` / `Other` (labels). Switch to keys (`income` / `other`) to match `CATEGORIES`, and migrate existing rows.

## Matching

`matchCategory(description, rules)` returns the winning rule's category, or `null`.

1. Normalise both sides: lowercase, trim, collapse whitespace.
2. A rule matches if its operator holds between description and pattern.
3. If several rules match, the most specific wins:
   1. Operator strength: `equals` > `startsWith` / `endsWith` > `contains`
   2. Longer pattern
   3. Older rule (`createdAt`)
4. No match → `income` for credits, `other` for debits, `categorySource = default`.

Lives in `packages/shared` so the backend (import) and frontend (review preview) use the same code. Needs specs for every operator and each tie-break.

## When rules run

- **Import (backend):** load the user's rules once, categorise each row, set `categorySource`. Return an `uncategorised` count so the summary stops counting every debit.
- **Review screen (frontend):** show the category each row would get, using the shared matcher.
- **Saving a rule:** show "matches N existing transactions — apply?". Applying skips `categorySource = manual`.
- **Manual change in the list:** sets `categorySource = manual` and offers to create a rule.

## API

All routes behind `requireAuth`, filtered by `userId`, validated with zod.

| Route | Purpose |
|---|---|
| `GET /api/category-rules` | List rules |
| `POST /api/category-rules` | Create |
| `PATCH /api/category-rules/:id` | Edit |
| `DELETE /api/category-rules/:id` | Delete |
| `POST /api/category-rules/:id/apply` | Apply one rule to existing non-manual transactions, returns `{ updated }` |
| `GET /api/category-rules/:id/preview` | Count of existing transactions it would change |

## UI

- **Settings → Category rules:** list of rules (operator, pattern, category), add / edit / delete.
- **Rule form:** operator dropdown, text input, `CategoryPicker`.
- **After a manual category change:** inline prompt to create a rule, pattern prefilled from the description and editable.
- **Import review:** category badge per row.

## Implementation steps

1. Shared matcher + migration + import route uses rules
2. Rules CRUD API + apply / preview
3. Rules UI + "create rule" prompt after a manual change

## Open questions

- ~~Default rules~~ — decided: an opt-in "Add suggested rules" button on the empty rules screen (`POST /api/category-rules/suggested`), not seeded at sign-up and not a hidden fallback
- Should a rule be able to match on the bank notes (`Mededelingen`)? That needs `notes` persisted first (Next up #3).
- Debit-only / credit-only rules, so a shop refund doesn't become Food?
- Duplicate rules (same pattern + operator): reject or allow?
- Pattern edge cases: empty pattern (reject), minimum length, very short patterns like "ah" matching too much.

## Later

- User-defined categories (a `categories` table; rules already reference keys, so the matcher is unchanged)
- Manual rule ordering, if automatic specificity ever falls short
