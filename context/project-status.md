# Personal Finance App — Project Status

> What's done and what's next. For goals, stack, architecture and data model see `project-overview.md`.

_Last updated: 27-10-2026_

| Phase | State |
|---|---|
| 1. Project setup | Done |
| 2. Auth & backend | Done — better-auth, Hono, Drizzle, D1; sign-in/sign-up pages working |
| 3. CSV import pipeline | In progress — schema, migrations, auth middleware, transactions routes, frontend parser and import screen (file picker → review → summary) done, including expandable review rows with bank notes and a results screen, and the transactions page reads real data; keyword categorisation still to do |
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
- Transactions page (`pages/index.vue`) now uses real data: `useTransactions(month)` (`GET /api/transactions?month=YYYY-MM`, mapped to `Transaction` in `transactions.api.ts`) feeds the list and the month summary totals, wrapped in `QueryBoundary`. Changing a category calls `PATCH /api/transactions/:id` via `useUpdateTransactionCategory` and refetches. `MOCK_TRANSACTIONS` is gone. The search box and category filter are still not applied to the list
- The import route's placeholder categories are now the lowercase keys `income` / `other` so they match `CATEGORIES`; rows imported earlier with `Income` / `Other` need re-importing or a manual fix
- Conditional classes in templates use object syntax or a computed instead of ternaries

---

## Next up

1. Rule-based categorisation on import using `category_rules` (the import route currently assigns a placeholder: `income` for positive amounts, otherwise `other`). Until then the summary's "Uncategorised" count is every imported debit, and it can't link to a filtered list because the ledger has no category filter. Design is in `docs/category-rules.md`; steps:
   1. Shared matcher (`packages/shared`), migration, import route applies rules
   2. Rules CRUD API plus apply / preview
   3. Rules UI under Settings, and a "create rule" prompt after a manual category change
2. Wire the transactions page's search box and category filter to the list

---

## Later phases

| Phase | Focus | Est. time |
|---|---|---|
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy backend to Cloudflare Workers + frontend to Pages | ~2h |
