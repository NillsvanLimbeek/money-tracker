# Personal Finance App — Project Status

> What's done and what's next. For goals, stack, architecture and data model see `project-overview.md`.

_Last updated: 17-11-2026_

| Phase | State |
|---|---|
| 1. Project setup | Done |
| 2. Auth & backend | Done — better-auth, Hono, Drizzle, D1; sign-in/sign-up pages working |
| 3. CSV import pipeline | Done — schema, migrations, auth, transactions routes, ING CSV parser, import flow (file → review → summary), category rules (backend, rules screen, add / edit / delete, create-rule prompt, rule-based categorisation on the review screen, suggested rules), transactions page search and category filter, Paraglide translations (English and Dutch), and Settings language, number format and date format options |
| 4. Dashboard views + charts | In progress — Insights page has the month picker, the net / income / expenses overview with deltas vs the previous month, and the spending by category chart |
| 5–7 | Not started |

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
- Frontend ING CSV parser (`features/import/utils/parse-ing-csv/`): Windows-1252 decoding, Dutch and English headers, cents, dedup hash with occurrence number, optional notes column (`Mededelingen` / `Notifications`) kept on `ImportRow.notes`
- `splitNotes` (`lib/utils/split-notes.ts`) breaks ING's single `Key: value Key: value` notes string onto separate lines using a list of known English and Dutch keys; text before the first key, or with none, stays one line
- Import screen (`pages/import.vue`) with a 2-step `Stepper` (file → review; hidden on the summary) and `PageHeader` slots:
  - `ImportFilePicker` — file selection, 10 MB and 5000-row limits
  - `ImportReview` — one `TransactionRow` per row (see below), grouped by month (`groupRowsByMonth`), per-row and per-month select all, duplicates shown as "Already imported" and disabled, Nuxt UI `UCheckbox`, income/expense totals, confirm button
    - Only the checkbox toggles selection; clicking anywhere else on a row expands it (see `TransactionRow`)
    - Found / Selected / Duplicates strip uses the generic `StatStrip` component (`{ label, value, valueClass? }[]`)
  - `ImportSummary` (`features/import/components/import-summary/`) — results screen after confirming: "N transactions imported", source file name and period (`formatPeriod`), In / Out / Skipped strip (`StatStrip`), an "Uncategorised" row linking to the ledger, "View transactions" and "Import another file". In/Out are computed from the rows that were sent; Skipped comes from the import response. The back chevron in the page header returns to file selection
- Column check step dropped: the parser already accepts both ING header variants, so the import flow stays two steps (file → review) and the summary sits outside the stepper. Revisit if more banks are added
- `TransactionRow` (`components/transaction-row/`) is the single row component for both the transaction list and the import review. It replaced `ImportReviewRow`, and the date, notes and toggle column are inlined rather than separate components:
  - Props: `transaction`, `categories`, `pickerOpen`, plus `selectable` / `selected` / `duplicate` for the import review. `selectable` adds a checkbox and makes the category badge read-only (no picker); `duplicate` dims the row, shows "Already imported" and disables the checkbox
  - Clicking the row or the chevron in the disclosure column on the far right expands it: the full name wraps (collapsed names truncate) and a "Bank description" box shows `transaction.notes` split by `splitNotes`. The category badge opens the picker without expanding the row
  - `importRowToTransaction` (`lib/utils/`) adapts a parsed `ImportRow` to a `Transaction` (import hash as id, euros, placeholder `income` / `other` category). `Transaction.notes` is optional and nothing fills it on the transactions page yet
  - `TransactionList` groups transactions by day (`groupTransactionsByDay`) and keeps which row's picker is open, so only one is open at a time
- Transactions page (`pages/index.vue`) now uses real data: `useTransactions(monthKey)` (`GET /api/transactions?month=YYYY-MM`, mapped to `Transaction` in `transactions.api.ts`) feeds the list and the month summary totals, wrapped in `QueryBoundary`. Changing a category calls `PATCH /api/transactions/:id` via `useUpdateTransactionCategory` and refetches. `MOCK_TRANSACTIONS` is gone
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
  - The frontend now imports `RuleOperator` from `@money-tracker/shared`

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

- Month picker, shared by the transactions and Insights pages (step 1 of the Insights page, which is otherwise still the header and picker only):
  - `MonthPicker` (`components/month-picker/`) is the prev / month label with chevron / next row. The side buttons are a fixed `size-12` so they stay square next to the taller label button; the label emits `open`
  - `MonthPickerDrawer` (`components/month-picker-drawer/`) is the "Choose month" bottom sheet: year stepper (next disabled on the current year), 3×4 month grid, a dot on imported months, an outline on the current month, future months disabled. Selecting a month closes the sheet. The dot is absolutely positioned so the label stays centred in the button
  - `GET /api/transactions/months` lists the `YYYY-MM` months the user has transactions in (`useImportedMonths` on the frontend, `getImportedMonths` in `transactions.api.ts`) and feeds the dots
  - `useDateStore` (`stores/date.ts`, Pinia) holds `selectedMonth` (first of the current month) and a `monthKey` getter (`yyyy-MM`). Both pages bind to it through `storeToRefs`, so the chosen month carries across pages. It is not persisted, so a reload goes back to the current month. The unused `stores/counter.ts` is gone
  - `MonthSummary` is now only the In / Out / Net card; the month navigation moved out into `MonthPicker`, which `pages/index.vue` renders above it
  - The "N transactions" count that was briefly in the Insights header is removed, along with its message and the page's transactions query
- `useMonthTotals(transactions)` (`lib/composables/use-month-totals/`) returns `{ income, expense }` computeds (expense as a positive number). `pages/index.vue` uses it, and Insights will for its summary card
- Composables live in folders with a spec each (`use-month-totals/`, `use-preferences/`) and are imported from the `@/lib/composables` barrel. `use-preferences.spec.ts` covers defaults, restoring and saving to `localStorage`, and the shared refs
- Test setup: `vitest.setup.ts` installs an in-memory `localStorage` (`src/test/create-storage.ts`), because Node's `--localstorage-file` flag leaves the jsdom one without `getItem`. It is defined directly rather than with `vi.stubGlobal`, so a spec's own `vi.stubGlobal` / `unstubAllGlobals` falls back to it
- Type imports use the `@/lib/types` alias everywhere instead of relative `../types` paths

---

## Translations (Paraglide)

- `@inlang/paraglide-js` is set up in `frontend/` with `en` (base) and `nl`. The Vite plugin (`paraglideVitePlugin` in `vite.config.ts`) compiles the messages into `src/paraglide/` on dev and build; that folder, `project.inlang/cache` and `project.inlang/.meta.json` are gitignored. `allowJs` is on in `tsconfig.app.json` because the output is JS with JSDoc types, and ESLint ignores it
- Strategy is `['localStorage', 'preferredLanguage', 'baseLocale']`: no locale in the URL, so the router is unchanged. `App.vue` sets `<html lang>` and passes the matching Nuxt UI locale to `UApp`
- Messages are split by section, one file per section and locale: `frontend/messages/{en,nl}/{common,transactions,rules,settings,import,auth}.json` (listed in `pathPattern` in `project.inlang/settings.json`). Keys are flat snake_case with a section prefix (`common_save`, `rule_form_new_title`); JSON can't be nested. A new key goes in the matching section file in both locales
- Used as `import { m } from '@/paraglide/messages'` and `m.key({ param })`. Singular / plural pairs are plural variants on `count` (`local countPlural = count: plural`), replacing the old `=== 1 ? … : …` branches
- Everything user-facing is translated: components, pages, category / operator / nav labels, form fields, zod messages, rule validation messages, CSV parse errors and the "Today ·" day label. Constants and zod schemas read the locale once at startup, so changing language needs a page reload (`setLocale` reloads by default)
- Settings has a "Language & region" section (`pages/settings/index.vue`): an EN / NL `SegmentedControl` (calls `setLocale`, which reloads the page), and "Number format" (`1.234,56` or `1,234.56`) and "Date format" (`DD-MM-YYYY` or `MM-DD-YYYY`) rows that open an `OptionDrawer`. The two format choices live in `usePreferences` (localStorage, shared module-level refs) and are read by `formatCurrency` and `formatDate`; `SettingsRow` got a `pressable` prop for a plain tappable row
- Month and weekday names follow the language: `dateFnsLocale()` (`lib/utils/date-fns-locale/`) maps the active Paraglide locale to the date-fns one and is passed to `format` for the day headers, month picker, import month groups, period label and the row date badge
- The date format preference also orders the day header (`Mon 5 Jan` or `Mon Jan 5`, via `dayLabel`) and the row date badge (day over month, or month over day); `isMonthFirst()` in `format-date.ts` is the switch
- Not done: the `nl` translations are unreviewed

---

## Feature folders

Page code moved out of `components/` and `lib/` into `frontend/src/features/<name>/` (`components/`, `utils/`, `constants/`, `types/`, `composables/`, each with an `index.ts` barrel). The page files stay in `src/pages/` because the router builds routes from that folder. Done for import, transactions, rules, settings, auth and insights. Component, util and composable names in the notes above (e.g. `ImportReview`, `RuleForm`, `useMonthTotals`) now live in their feature folder. Only generic UI stays in `src/components/` (`Box`, `TransactionRow`, `MonthPicker`, `PageHeader`, …). Full file list and what stayed shared: `docs/feature-component-inventory.md`

---

## Insights page (phase 4, in progress)

`pages/insights.vue` binds to `useDateStore` and loads the selected and previous month with `useTransactions`, totals from `useMonthTotals`. Code is in `features/insights/`:
- `InsightsOverview` — net for the month with a `DeltaChip` (amount vs previous month), plus income and expenses cards with percentage deltas and a "kept N%" figure. `percentChange` (`utils/percent-change/`) does the delta maths
- `SpendingByCategory` — donut (`CategoryDonut`, Chart.js via `vue-chartjs`) and one `CategorySpendRow` per category, with each category's share (`formatPercent`) and change vs the previous month. `groupSpendingByCategory` (`utils/`) builds the rows. each row links to the transactions page filtered by that category (`/?category=food`); spending up is red, down is green. `formatEuros` (`lib/utils/format-currency/`) is the new unsigned euro formatter with a `fractionDigits` argument
- All strings are in `messages/{en,nl}/insights.json`; the units have specs
- Still to do for phase 4: other dashboard views (e.g. trends over several months) and charts

---

## Storybook

- Storybook 10 (`@storybook/vue3-vite`, `addon-docs`) in `frontend/.storybook/` (`main.ts`, `preview.ts`, `StoryWrapper.vue`). Run with `pnpm storybook` (port 6006), build with `pnpm build-storybook`. The Vue devtools plugin is filtered out of the Storybook Vite config
- Stories are `*.stories.ts` beside the component, one for each of the 12 components in `src/components/` (`BottomNav`, `Box`, `CategoryBadge`, `CategoryPicker`, `CurrencyAmount`, `DesktopBlocker`, `MonthPicker`, `MonthPickerDrawer`, `PageHeader`, `QueryBoundary`, `TransactionDescription`, `TransactionRow`)
- The import feature's components have stories too, titled `Import/…` (`ImportDescription`, `Stepper`, `StatStrip`, `ImportFilePicker`, `ImportReview`, `ImportSummary`), each beside its component
- The auth feature's components have stories titled `Auth/…` (`AuthTabs`, `AuthFormField`)
- Rules, transactions, settings and insights components have no stories yet

---

## Known gaps

- The `nl` translations are unreviewed
- Changing the language reloads the page, because messages are read once at startup
- Rules, transactions, settings and insights components have no Storybook stories (import and auth have them)
- `README.md` is still the Vite template and `frontend/e2e/vue.spec.ts` is the default scaffold

---

## Phase 3 plan (completed)

1. Finish rule-based categorisation (import already applies the user's rules; the placeholder `income` / `other` is only the fallback). Design is in `docs/category-rules.md`; steps:
   0. Done — the category filter on `pages/index.vue` is driven by the URL (`?category=food,other`, unknown keys ignored, changes use `router.replace`); the summary's "Uncategorised" row links to `/?category=other`
   1. Rules UI: done — the list screen, the add and edit forms (with apply on save), the actions / delete drawers and the "Edit existing rule" link on the duplicate error are built
   2. Done — the review screen previews each row's category: `pages/import.vue` loads the rules (`useCategoryRules`) and passes them to `ImportReview`, which calls `importRowToTransaction(row, rules)`; that runs the shared `matchCategory` (list order stands in for `createdAt` in the tie-break) and falls back to `income` / `other`
   3. Done — suggested rules: the empty rules screen has an "Add suggested rules" button. `POST /api/category-rules/suggested` (`utils/add-suggested-rules/`) inserts the starter list from `backend/src/constants/suggested-rules.ts` (common Dutch merchants), skips any the user already has (same pattern and operator), then recategorises existing non-manual transactions the new rules win, returning `{ created, updated }`. The frontend calls it through `useAddSuggestedRules`

---

## Later phases

| Phase | Focus | Est. time |
|---|---|---|
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy backend to Cloudflare Workers + frontend to Pages | ~2h |
