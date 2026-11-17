# Code review: money-tracker (2026-11-17)

**Verdict:** approve with changes.

The backend is in good shape. Every query is scoped by `userId`, input goes through Zod, and the import is idempotent. The matcher is pure and shared by the frontend and backend, and each util has a spec.

## Checks run

- **Type-check:** clean.
- **Unit tests:** 69 backend and 290 frontend, all passing.
- **Lint:** fails, formatting only (see Nits).

## Scope

**Read:** all backend source, the shared matcher, the frontend API layer, the CSV parser, the auth store and router, and the `index`, `import` and `insights` pages.

**Not reviewed:** the individual Vue components, stories, messages, e2e tests, `settings/rules.vue`, and the sign-in and sign-up pages.

## Required

### 1. The Uncategorized inbox can't be built from what the API returns

The backend tracks `categorySource` (`rule`, `manual` or `default`). `GET /api/transactions` returns it, but `getTransactions()` in `frontend/src/lib/api/transactions/transactions.api.ts` drops it when mapping rows to `Transaction`.

- **Effect:** a debit that fell back to `other` looks identical to one you deliberately set to `other`.
- **Why it matters:** the inbox is the core of the v1 loop. The import summary shows an "uncategorised" count, but nothing can list those rows.
- **Fix:** carry `categorySource` through the `Transaction` type, and filter the inbox on `categorySource === 'default'`.

### 2. The import route loads rules without a defined order

`backend/src/routes/transactions.ts:94` uses a raw `db.select()` on `categoryRules`. Everywhere else uses `loadRules()`, which orders by `createdAt, id`.

- **Why it matters:** `findWinningRule` breaks ties by array order. `addSuggestedRules` gives every starter rule the same `createdAt`, so ties are real. Import can pick a different winner than preview or apply would.
- **Fix:** call `loadRules(db, userId)` in the import route.

## Consider

### 3. Sign-up is open

`POST /api/sign-up` forwards straight to Better Auth, so anyone who finds a deployed worker can register. Fine locally. Before deploying, set `emailAndPassword.disableSignUp` once your account exists.

### 4. Categories aren't validated on the server

`PATCH /transactions/:id` and rule create/update accept any non-empty string as a category. A typo creates a category the UI can't show, so that money disappears from the breakdown. The category list lives only in the frontend's `CATEGORIES`. Moving it to `@money-tracker/shared` would let both sides validate against it.

### 5. `parseCents` would misread dot decimals

`frontend/src/features/import/utils/parse-ing-csv/parse-ing-csv.ts` strips every `.` as a thousands separator, so `12.50` becomes 125000 cents (€1,250.00) with no error. Safe if ING always exports comma decimals, as `sample-ing.csv` does, but this is unverified. Add a spec either way.

### 6. Insights show a new category's change as 0%

`percentChange` returns `0` when last month was `0`, so a category with no spending last month shows "no change". Return `null` and have `DeltaChip` render "new". Worth fixing while finishing insights.

### 7. The import limit is hard-coded in two places

`MAX_IMPORT_ROWS = 5000` is declared in `frontend/src/pages/import.vue:12` and in `backend/src/constants/transactions.ts`. Move it into `@money-tracker/shared`.

### 8. Large imports may hit D1's per-request query limit

With the 100-parameter cap, `IMPORT_CHUNK_SIZE` is 8, so 5000 rows becomes 625 insert statements in one `db.batch`. D1's limits on statements per invocation are not verified. A single-month CSV is far under this, but test at 5000 rows before relying on that ceiling.

### 9. The rules list scales as rules × transactions

`GET /category-rules` and every create or update load every description and count matches in memory (`toApiRule`). Fine for a personal ledger. If it slows down, compute `matches` in SQL.

## Nits

- **Lint fails on formatting only.** 5 missing end-of-file newlines in the generated `backend/drizzle/*/snapshot.json` files, plus 3 `jsonc/sort-keys` errors in `frontend/package.json` (storybook keys). Ignore `drizzle/**` in ESLint and run `lint:fix` for the rest.
- **`getAuth` rebuilds Better Auth and the DB client on every request,** and `requireAuth` plus the route each call it. Could be memoized per isolate.
- **The auth store caches a rejected `restoring` promise.** If `getSession` throws, every navigation fails until a reload. A returned `{ error }` is treated as signed out.
- **Category shares are rounded one by one,** so they may not sum to exactly 100%.

## Suggested order

1. Fix #1 and #2 alongside the insights work, since they sit on the v1 loop.
2. Fix #3 before deploying anywhere public.
3. Fix #6 while finishing insights.
4. Pick up #4, #5, #7 and #8 as convenient.
5. Do the lint cleanup in a separate commit.

## Status

No findings fixed yet.
