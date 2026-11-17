# Simplification report (2026-11-17)

Read-only pass: no files were changed. I read the backend in full, the shared matcher, the frontend API layer, and the rules, import, index and insights pages. Most Vue components were not opened, so nothing below covers them.

Each item should leave behavior unchanged and keep the existing specs passing without edits.

Related: [`code-review-2026-11-17.md`](code-review-2026-11-17.md)

## Worth doing

### 1. Move the fallback category into `@money-tracker/shared`

The rule `amountCents > 0 ? 'income' : 'other'` is written twice: in `backend/src/routes/transactions.ts:104` and in `frontend/src/features/import/utils/import-row-to-transaction/import-row-to-transaction.ts:25`. The frontend comment says it must match what the import route stores, so if one changes, the import preview silently disagrees with what gets stored. A shared `fallbackCategory(amountCents)` fixes that.

### 2. Move the duplicate-rule check into shared

`isDuplicate` in the backend and the `rules.find(...)` inside `validateRule` do the same thing: same operator, same normalised pattern. Export one `findDuplicateRule(rules, pattern, operator, exceptId?)` from shared and use it in both places. `validateRule` also needs the matching rule's id, which the shared function would return.

### 3. Share the types and constants that exist twice

- `RuleMatchGroup` is declared in `backend/src/utils/preview-rule-matches/` and again in `frontend/src/lib/types/CategoryRule.ts`.
- `MAX_IMPORT_ROWS = 5000` is in `frontend/src/pages/import.vue:12` and in `backend/src/constants/transactions.ts`.

### 4. Pull the repeated batching out of the backend

Three places chunk an array and run `db.batch(statements as [typeof statements[number], ...])`: the import route, `/:id/apply`, and `addSuggestedRules`. The last one already has a local `batch` helper that the others don't use. Add `chunk(items, size)` and `runBatch(db, statements)` to `utils` and delete the three casts.

### 5. Reuse `loadRules` in the import route, and add a `findRule` helper

- The import route (`routes/transactions.ts:94`) runs its own unordered rules query. This is finding #2 in the code review, so it's a fix as well as a cleanup.
- `PATCH /:id`, `/:id/preview` and `/:id/apply` each load the rules, find one by id, and return the same 404. A `findRule(rules, id)` plus one shared 404 response removes about 10 lines each.

### 6. Delete dead code (confirm first)

- `frontend/src/lib/api/health/health.api.ts` and `health.queries.ts` are not used anywhere. The backend `/health` route and its entry in `routes-get.ts` can stay.

## Needs a decision

### 7. The `autoCategorise` and `suggestRule` settings do nothing

They're stored in localStorage and shown as switches in `pages/settings/index.vue`, but nothing reads them. The rule prompt in `pages/index.vue` always opens. Either wire them up or remove the two switches and refs. This changes what the settings page shows, so it isn't a pure simplification.

### 8. `findChangedIds` and `addSuggestedRules` repeat the same selection

Both load non-manual transactions and keep those where a given rule wins and the category differs. A shared `findRuleChanges` would collapse them, but it touches the most logic-heavy code, so do it last, if at all.

## Optional

- **`pages/index.vue` (199 lines) does three jobs:** the ledger, the URL-synced category filter, and the "create a rule?" prompt. Extracting `useRulePrompt()` (about 30 lines) and `useCategoryFilter()` would make it easier to scan. Do it as its own commit.
- **`pages/settings/rules.vue` holds the form as five separate refs,** which `addRule` and `editRule` reset by hand. One `draft` object would cut the reset code, but `RuleForm`'s four `defineModel`s are built around the current shape, so the gain is small.
- **`lib/api/client/fetch.ts` writes `const res = await ...; return res;` four times.** Returning directly is trivial and safe.

## Left alone on purpose

- **`async` plus `return await` in the `*.api.ts` files.** Consistent across the project and possibly enforced by lint. Changing it would be churn.
- **The `isMoreSpecific` tie-break in the matcher.** It reads clearly and has specs.
- **Chunk constants like `IMPORT_CHUNK_SIZE = 8`.** The comments explain they come from D1's parameter limit.

## Suggested plan

Do items 1 through 6, one small commit each, running the backend and frontend tests after every step. That removes roughly 60 to 80 lines and the places where the frontend and backend can drift apart. Items 7 and 8 and the optional ones are separate decisions.

## Status

Nothing applied yet.
