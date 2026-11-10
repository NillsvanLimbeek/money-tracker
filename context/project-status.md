# Personal Finance App — Project Status

> What's done and what's next. For goals, stack, architecture and data model see `project-overview.md`.

_Last updated: 06-11-2026_

| Phase | State |
|---|---|
| 1. Project setup | Done |
| 2. Auth & backend | Done — better-auth, Hono, Drizzle, D1; sign-in/sign-up pages working |
| 3. CSV import pipeline | In progress — schema, migrations, auth middleware, transactions routes, frontend parser and import screen (file picker → review → summary) done, including expandable review rows with bank notes and a results screen, and the transactions page reads real data; category rules backend, the rules screen and the add / edit / delete rule flow (forms and drawers) done, the manual-change rule prompt done, rule-based categorisation shown on the review screen done, transactions page search and category filter done; UI strings moved to Paraglide (English and Dutch) |
| 4–7 | Not started |

---

## Done in phase 3 so far

- Drizzle schema split into `backend/src/db/schema/` (`auth.ts`, `transactions.ts`, `category-rules.ts`) with an `index.ts` barrel
- `transactions` and `category_rules` tables added, both scoped per user (see Data Model in `project-overview.md`)
- Migrations generated and applied locally (`drizzle/`)
- `backend/src/db/relations.ts` added; `Db` type is `DrizzleD1Database<typeof relations>`
- `requireAuth` middleware (`middleware/require-auth.ts`) resolves the session and sets `userId` in the Hono context; applied to `/api/transactions/*`
- Transactions routes (`routes/transactions.ts`), all filtered by `userId` and validated with zod (`schemas/`, `middleware/validate.ts`):
  - `GET /api/transactions` with optional `month` filter
  - `POST /api/transactions/import` — chunked inserts, dedup via `(userId, importHash)` conflict, returns `{ imported, skipped }`
  - `GET /api/transactions/hashes?from&to` — import hashes already stored for the user in an ISO date range, so the review screen can flag duplicates
  - `PATCH /api/transactions/:id` — category override, 404 if not found for the user
- `packages/*` added to the workspace with a placeholder `packages/shared`
- Frontend ING CSV parser (`lib/utils/parse-ing-csv.ts`): Windows-1252 decoding, Dutch and English headers, cents, dedup hash with occurrence number, optional notes column (`Mededelingen` / `Notifications`) kept on `ImportRow.notes`
- `splitNotes` (`lib/utils/split-notes.ts`) breaks ING's single `Key: value Key: value` notes string onto separate lines using a list of known English and Dutch keys; text before the first key, or with none, stays one line
- Import screen (`pages/import.vue`) with a 2-step `Stepper` (file → review; hidden on the summary) and `PageHeader` slots:
  - `ImportFilePicker` — file selection, 10 MB and 5000-row limits
  - `ImportReview` — one `TransactionRow` per row (see below), grouped by month (`groupRowsByMonth`), per-row and per-month select all, duplicates shown as "Already imported" and disabled, Nuxt UI `UCheckbox`, income/expense totals, confirm button
    - Only the checkbox toggles selection; clicking anywhere else on a row expands it (see `TransactionRow`)
    - Found / Selected / Duplicates strip uses the generic `StatStrip` component (`{ label, value, valueClass? }[]`)
  - `ImportSummary` (`components/import-summary/`) — results screen after confirming: "N transactions imported", source file name and period (`formatPeriod`), In / Out / Skipped strip (`StatStrip`), an "Uncategorised" row linking to the ledger, "View transactions" and "Import another file". In/Out are computed from the rows that were sent; Skipped comes from the import response. The back chevron in the page header returns to file selection
- Column check step dropped: the parser already accepts both ING header variants, so the import flow stays two steps (file → review) and the summary sits outside the stepper. Revisit if more banks are added
- `TransactionRow` (`components/transaction-row/`) is the single row component for both the transaction list and the import review. It replaced `ImportReviewRow`, and the date, notes and toggle column are inlined rather than separate components:
  - Props: `transaction`, `categories`, `pickerOpen`, plus `selectable` / `selected` / `duplicate` for the import review. `selectable` adds a checkbox and makes the category badge read-only (no picker); `duplicate` dims the row, shows "Already imported" and disables the checkbox
  - Clicking the row or the chevron in the disclosure column on the far right expands it: the full name wraps (collapsed names truncate) and a "Bank description" box shows `transaction.notes` split by `splitNotes`. The category badge opens the picker without expanding the row
  - `importRowToTransaction` (`lib/utils/`) adapts a parsed `ImportRow` to a `Transaction` (import hash as id, euros, placeholder `income` / `other` category). `Transaction.notes` is optional and nothing fills it on the transactions page yet
  - `TransactionList` groups transactions by day (`groupTransactionsByDay`) and keeps which row's picker is open, so only one is open at a time
- Transactions page (`pages/index.vue`) now uses real data: `useTransactions(month)` (`GET /api/transactions?month=YYYY-MM`, mapped to `Transaction` in `transactions.api.ts`) feeds the list and the month summary totals, wrapped in `QueryBoundary`. Changing a category calls `PATCH /api/transactions/:id` via `useUpdateTransactionCategory` and refetches. `MOCK_TRANSACTIONS` is gone
- The import route's placeholder categories are now the lowercase keys `income` / `other` so they match `CATEGORIES`, and the local database has no leftover `Income` / `Other` rows
- Conditional classes in templates use object syntax or a computed instead of ternaries

---

- Category rules backend (steps 1 and 2 of `docs/category-rules.md`):
  - `packages/shared` is now the `@money-tracker/shared` workspace package (TS source exported directly, own vitest + eslint). It holds the matcher: `ruleMatches`, `findWinningRule` (equals > starts/ends > contains, then longer pattern, then older rule) and `matchCategory`; the backend depends on it
  - Migration `20261029143319_sour_miss_america`: `category_rules` recreated with `pattern` / `operator` / `createdAt` (the old `keyword` / `priority` table was never written to), and `transactions.category_source` added
  - Import applies the user's rules (`categorySource` `rule`, otherwise the `income` / `other` placeholder as `default`); `PATCH /api/transactions/:id` sets `manual`. `IMPORT_CHUNK_SIZE` dropped to 8 because a row now binds 12 parameters
  - `routes/category-rules.ts` (behind `requireAuth`): `GET /` (each rule with a `matches` count, computed by running the matcher over the user's descriptions), `POST /`, `PATCH /:id`, `DELETE /:id` (204), `GET /:id/preview` (`{ count }`), `POST /:id/apply` (`{ updated }`). Apply and preview only touch non-manual rows that this rule wins and that aren't already in its category. A duplicate pattern + operator (normalised) is rejected with 409
  - `GET /api/category-rules/preview?pattern&operator` previews an unsaved rule: `{ count, descriptions }`, one entry per distinct description (newest date and amount, `count` of repeats), most frequent first
  - `POST /api/transactions/import` now responds `{ imported, skipped, uncategorised }`: `uncategorised` counts newly stored debits no rule matched (skipped duplicates and income excluded), and `ImportSummary` shows it instead of counting every debit
  - Not done: the frontend still has its own `RuleOperator` type rather than importing from shared

- New rule form, opened from "Add rule" on `pages/settings/rules.vue` (the page owns the draft state, the preview query and the create / apply mutations, and shows a toast on success or failure):
  - `RuleForm` (`components/rule-form/`) is a Nuxt UI `UForm` whose fields are generated from `RULE_FIELDS` (`lib/constants/rule-fields.ts`, typed by `RuleFieldConfig` / `RuleDraft`). Its `validate` function blocks an empty or duplicate pattern and a missing category; the short-pattern warning is a separate amber box and does not block saving. Save & apply is the form's submit button, Save validates silently and then emits
  - `validateRule` (`lib/utils/`) holds the pattern checks; it warns under `MIN_PATTERN_LENGTH` (3) characters and uses `normalise` from `@money-tracker/shared` (now a frontend dependency) for the duplicate check
  - `CategorySelect` (category grid with icons from `CATEGORY_ICONS`, `v-model` is the selected key) and `RulePreview` (match count plus one row per distinct description with date, `×N` and amount) are standalone components
  - `AppDrawer` (`components/app-drawer/`) is the generic drawer: title, close button, default slot as body, optional `footer` slot. It is a fixed `92dvh` so the sheet doesn't shift as content appears, and only the body scrolls. `CategoryDrawer` (the filter drawer) still uses `UDrawer` directly because it needs a Reset button in the header
  - Frontend API (`lib/api/category-rules/`): `createCategoryRule`, `updateCategoryRule`, `applyCategoryRule`, `previewCategoryRule`, `deleteCategoryRule` with `useCreateCategoryRule`, `useUpdateCategoryRule`, `useApplyCategoryRule`, `useRulePreview`, `useDeleteCategoryRule`
  - Editing: the "Edit" item in a rule's menu opens the same drawer ("Edit rule") prefilled; the page tracks `editingId` and saves through `useUpdateCategoryRule` (`PATCH /api/category-rules/:id`) instead of create. `validateRule` takes an `ignoreId` so a rule isn't its own duplicate. Save & apply re-applies the edited rule; plain Save leaves already-categorised transactions as they are
  - Rule actions use drawers instead of a dropdown or inline box. `RuleRow` shows the rule and a `⋯` button; the button opens `RuleActions` (`components/rule-actions/`, a short bottom sheet titled with the rule, with Edit and Delete), and Delete opens `RuleDeleteDrawer` (`components/rule-delete-drawer/`, "Delete this rule?" with Cancel / Delete rule). Both take `v-model:open` (`defineModel`) and emit `edit` / `delete`; `RuleRow` owns the open state and closes one before opening the other, and `RuleGroup` re-emits `edit` and `delete` up to the page. They use `UDrawer` directly with the shared `DRAWER_UI` overlay style (`lib/constants/drawer-ui.ts`) rather than `AppDrawer`, which is too tall for two buttons
  - `Chip` (`components/chip/`) is the category filter chip on the rules screen (label, count, selected state, emits `select`)
  - Create-rule prompt: after a manual category change on the transactions page (except to `other`), `RulePromptDrawer` (`components/rule-prompt-drawer/`) asks "Always categorise as X?" with the description prefilled as an editable `contains` pattern, a live match count and the same `validateRule` checks. "Create rule" creates and applies the rule (toast with the updated count); "Not now" dismisses. State lives in `pages/index.vue`
  - Duplicate error: `validateRule` returns the `duplicateId`; `RuleForm` shows an "Edit existing rule" link button under the pattern and emits `editExisting`, and the page switches the drawer to editing that rule

- Transactions page search and category filter (`pages/index.vue`):
  - `filterTransactions` (`lib/utils/filter-transactions/`) combines the selected categories with a Fuse.js fuzzy search over merchant and bank notes (best matches first); `TransactionFilters` is its input type. The page shows "No transactions found" when nothing matches
  - `CategoryDrawer` (the filter drawer) holds the category chips. Its trigger button is tinted (`primary` / `soft`) while filters are active and reads "Filter", "1 filter" or "N filters" from a single `filter_count` message (`count=0` plus plural variants, two selectors); it is `shrink-0 whitespace-nowrap` so the search input can't squeeze the label onto two lines
  - `SearchFilterSelection` (`components/search-filter-selection/`) is the results banner under the search row, shown while any category is selected: a dot per category, "N of M in Food, …" and a Clear button that resets the categories. The counts follow the current month and search text. It sits inside the sticky header
  - The search input shows a trailing cross icon (`transactions_search_clear` aria label) while it has text, which empties it
  - `TransactionList` renders each day as its own rounded card with a `gap-4` between days instead of one shared card
  - Sticky header fix: the app wrapper in `App.vue` is `min-h-screen` rather than `h-screen`. A sticky element only stays pinned inside its parent, and a fixed one-screen parent let the header scroll away on long lists

---

## Translations (Paraglide)

- `@inlang/paraglide-js` is set up in `frontend/` with `en` (base) and `nl`. The Vite plugin (`paraglideVitePlugin` in `vite.config.ts`) compiles the messages into `src/paraglide/` on dev and build; that folder, `project.inlang/cache` and `project.inlang/.meta.json` are gitignored. `allowJs` is on in `tsconfig.app.json` because the output is JS with JSDoc types, and ESLint ignores it
- Strategy is `['localStorage', 'preferredLanguage', 'baseLocale']`: no locale in the URL, so the router is unchanged. `App.vue` sets `<html lang>` and passes the matching Nuxt UI locale to `UApp`
- Messages are split by section, one file per section and locale: `frontend/messages/{en,nl}/{common,transactions,rules,settings,import,auth}.json` (listed in `pathPattern` in `project.inlang/settings.json`). Keys are flat snake_case with a section prefix (`common_save`, `rule_form_new_title`); JSON can't be nested. A new key goes in the matching section file in both locales
- Used as `import { m } from '@/paraglide/messages'` and `m.key({ param })`. Singular / plural pairs are plural variants on `count` (`local countPlural = count: plural`), replacing the old `=== 1 ? … : …` branches
- Everything user-facing is translated: components, pages, category / operator / nav labels, form fields, zod messages, rule validation messages, CSV parse errors and the "Today ·" day label. Constants and zod schemas read the locale once at startup, so changing language needs a page reload (`setLocale` reloads by default)
- Not done: there is no language switcher in Settings; dates and currency keep their current formatting (date-fns English month names, `nl-NL` euros) so month names stay English in the Dutch UI; the `nl` translations are unreviewed

---

## Next up

1. Finish rule-based categorisation (import already applies the user's rules; the placeholder `income` / `other` is only the fallback). Design is in `docs/category-rules.md`; steps:
   0. Done — the category filter on `pages/index.vue` is driven by the URL (`?category=food,other`, unknown keys ignored, changes use `router.replace`); the summary's "Uncategorised" row links to `/?category=other`. The month isn't in the URL, so rows imported into past months still need the month picked by hand
   1. Rules UI: done — the list screen, the add and edit forms (with apply on save), the actions / delete drawers and the "Edit existing rule" link on the duplicate error are built
   2. Done — the review screen previews each row's category: `pages/import.vue` loads the rules (`useCategoryRules`) and passes them to `ImportReview`, which calls `importRowToTransaction(row, rules)`; that runs the shared `matchCategory` (list order stands in for `createdAt` in the tie-break) and falls back to `income` / `other`
   3. Done — suggested rules: the empty rules screen has an "Add suggested rules" button. `POST /api/category-rules/suggested` (`utils/add-suggested-rules/`) inserts the starter list from `backend/src/constants/suggested-rules.ts` (common Dutch merchants), skips any the user already has (same pattern and operator), then recategorises existing non-manual transactions the new rules win, returning `{ created, updated }`. The frontend calls it through `useAddSuggestedRules`

---

## Later phases

Also later: a language switcher in Settings and localised date formatting (see Translations).

| Phase | Focus | Est. time |
|---|---|---|
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy backend to Cloudflare Workers + frontend to Pages | ~2h |
