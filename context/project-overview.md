# Personal Finance App — Project Overview

> A personal finance tracker for importing, categorising, and analysing ING bank transactions. Not a SaaS — built for one user, runs in the browser (installable as a PWA) from a single codebase.

---

## Status

Progress, what has been built and what is next live in [`project-status.md`](./project-status.md).

---

## Goals

- Import monthly CSV exports from ING and see a clear picture of income vs expenses
- Categorise transactions automatically (keyword rules) with the option to override manually
- View spending by category and month-over-month trends
- Get occasional AI-assisted analysis by copying a formatted summary into any AI chat
- Access the app on any device via the browser / installed PWA

---

## Tech Stack

**Frontend (`frontend/`)**

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vite + Vue 3 + TypeScript | Lightweight, no SSR overhead |
| Routing | Vue Router | File-based routing via `unplugin-vue-router` |
| State management | Pinia | Transactions, filters, UI state |
| Server state | TanStack Query (`@tanstack/vue-query`) | Queries and mutations per API area in `lib/api/` |
| UI | Nuxt UI | Forms (`UForm` / `UFormField`), drawers, toasts; category colours are CSS variables in `main.css` |
| i18n | Paraglide JS (`@inlang/paraglide-js`) | Compiled, tree-shakeable messages (`m.some_key()`); English and Dutch. Messages live in `frontend/messages/{locale}/<section>.json` |
| PWA | `vite-plugin-pwa` | Installable from the browser |
| Charts | vue-chartjs | Chart.js wrapper for Vue |

**Backend (`backend/`)**

| Layer | Choice | Notes |
|---|---|---|
| Framework | Hono | Lightweight, fast, already familiar; built natively for the Workers runtime |
| Auth | better-auth | Kysely adapter, D1-compatible, single user |
| ORM | Drizzle ORM | SQLite dialect (`sqliteTable`) for D1 |
| Database | Cloudflare D1 | Serverless SQLite, native Workers binding |
| Deployment | Cloudflare Workers | Free tier, single-provider stack with D1 |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│         backend/  —  Hono on Cloudflare Workers       │
│   Hono API  →  better-auth                          │
│             →  /api/transactions                    │
│             →  Drizzle ORM (sqlite) → D1 binding    │
└──────────────────────────────────────────────────────┘
                          ↑
              PWA (browser, desktop, mobile)
                          ↑
┌──────────────────────────────────────────────────────┐
│        frontend/  —  Vite + Vue 3 + TypeScript       │
│        (static build — served via Cloudflare Pages)  │
└──────────────────────────────────────────────────────┘
```

The monorepo has two packages with a clean separation:

- **`frontend/`** — Vite + Vue 3 app. Compiled to static files and served as a PWA via Cloudflare Pages. Talks to the backend exclusively via REST API calls.
- **`backend/`** — Hono app deployed as a Cloudflare Worker. Handles auth (better-auth), all API routes, and database access via Drizzle + D1. Shared by all clients.

**Infrastructure — everything on Cloudflare:**

- **Cloudflare Workers** — Hosts the Hono backend. Hono was built for the Workers runtime natively (Fetch API-based, no Node-specific APIs), so this is a clean fit with no compatibility shims needed. Free tier is generous; paid tier is $5/month if usage grows beyond it.
- **Cloudflare D1** — Serverless SQLite, bound directly to the Worker (no external connection string or pooler needed). Free tier is generous and pairs naturally with the Workers free tier.
- **Cloudflare Pages** — Serves the static frontend build for the PWA.

### Why Cloudflare Workers + D1 over the alternatives considered

- **Fly.io** — no longer offers a free tier for new accounts
- **Railway** — free tier is now a one-time trial credit, not ongoing
- **Render** — free tier works but has cold starts on traditional Node servers
- **Neon (considered earlier)** — a solid serverless Postgres option, but required Cloudflare Hyperdrive as a connection layer between the Worker and the database. Moving to D1 removes that extra moving part — D1 is a native Workers binding, no pooler required
- **Cloudflare Workers + D1** — single provider for compute and database, generous free tier, no cold-start issue, and Hono is designed specifically for this runtime

### D1 vs Postgres — what changed with this choice

D1 is SQLite, not Postgres-compatible, which affects a few things:

- Drizzle schema uses `sqliteTable` instead of `pgTable` — a straightforward rewrite for two tables
- No native `numeric`/`decimal` type — store transaction amounts as integers in cents to avoid floating-point issues
- No `timestamptz` type — store dates/timestamps as ISO text or unix integers
- No database branching (a Neon feature) — not a concern for a single-user app
- Local dev is a local SQLite file via Wrangler, which is lightweight and easy to reset

For this app's two simple tables with no complex relational queries or JSON columns, D1 is a good fit and removes Hyperdrive from the architecture entirely.

---

## Data Source

Transactions come from **ING Netherlands CSV exports**. Exported manually once a month from [bankieren.mijn.ing.nl](https://bankieren.mijn.ing.nl) via "Af- en bijschrijvingen downloaden" — takes about 30 seconds.

There is no automated sync. ING has no personal API, and the PSD2 open banking route (GoCardless/Nordigen) is no longer open to new signups. The manual step is intentionally kept small.

### ING CSV format

| Column | Notes |
|---|---|
| `Datum` | Date in `YYYYMMDD` format — no separators |
| `Naam / Omschrijving` | Counter-party name |
| `Rekening` | Your own IBAN |
| `Tegenrekening` | Counter-party IBAN |
| `Code` | Mutation code (`GT`, `BA`, `DV`, etc.) |
| `Af Bij` | `Af` = debit, `Bij` = credit — this determines the sign |
| `Bedrag (EUR)` | Always positive, comma as decimal separator |
| `MutatieSoort` | Mutation type (`Betaalautomaat`, `Internetbankieren`, etc.) |
| `Mededelingen` | Free-text description / memo |

The columns above are the Dutch headers. Accounts set to English export `Date`, `Name / Description`, `Account`, `Counterparty`, `Code`, `Debit/credit` (`Debit`/`Credit`), `Amount (EUR)`, `Transaction type`, `Notifications`, `Resulting balance` and `Tag`, semicolon-delimited. The parser accepts both.

**Parsing gotchas:**

- Encoding is **Windows-1252**, not UTF-8 — use `TextDecoder('windows-1252')` in the browser
- `Bedrag` is always positive — check `Af Bij` for the sign
- Decimal separator is a **comma** — replace before `parseFloat`
- Deduplication uses a hash of `date + amount + description` plus an occurrence number (so two identical purchases on one day both survive) to prevent double-importing the same rows
- Since D1 has no native decimal type, convert the parsed amount to integer cents before storing (e.g. `12,50` → `1250`)

---

## Data Model

D1 uses SQLite types via Drizzle's `sqliteTable`. Schema lives in `backend/src/db/schema/`, one file per area, re-exported from `index.ts`. Both drizzle-kit configs point at `schema/index.ts` only (pointing at the folder makes drizzle-kit see every table twice and fail with "duplicate" errors).

The project uses **drizzle-orm / drizzle-kit 1.0.0-rc**: the client takes `relations` (built with `defineRelations(schema)` in `db/relations.ts`), not the old `schema` option.

Every user-owned table has a `userId` foreign key to `user.id` with `onDelete: 'cascade'`, and every query must filter by it so the app can support more than one user.

### `transactions`

```ts
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),                 // uuid
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),                  // ISO date string (YYYY-MM-DD) for sorting/range queries, parsed from YYYYMMDD; displayed as DD-MM-YYYY
  description: text('description').notNull(),    // Naam / Omschrijving
  amountCents: integer('amount_cents').notNull(), // Negative = expense, positive = income
  category: text('category').notNull(),           // Auto-assigned or manually overridden
  categorySource: text('category_source').notNull().default('default'), // 'rule' | 'manual' | 'default'
  rawCounterparty: text('raw_counterparty'),       // Tegenrekening IBAN
  mutationType: text('mutation_type'),              // MutatieSoort
  importHash: text('import_hash').notNull(),        // SHA hash for deduplication
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, table => [
  uniqueIndex('transactions_user_id_import_hash_unique').on(table.userId, table.importHash), // dedup per user
  index('transactions_user_id_date_idx').on(table.userId, table.date),                       // month queries
]);
```

### `category_rules`

```ts
export const categoryRules = sqliteTable('category_rules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  pattern: text('pattern').notNull(),       // Matched against description (case-insensitive)
  operator: text('operator').notNull(),     // 'contains' | 'equals' | 'startsWith' | 'endsWith'
  category: text('category').notNull(),     // Category key to assign on match (e.g. 'food')
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(), // Tie-break: oldest wins
}, table => [
  index('category_rules_user_id_idx').on(table.userId),
]);
```

`transactions` also has a `categorySource` column (`rule` | `manual` | `default`, default `default`) so applying rules never overwrites a manual override. Design in `docs/category-rules.md`.

Auth tables (`user`, `session`, `account`, `verification`) are generated by better-auth and live in `schema/auth.ts`.

### Multi-user notes

- Deduplication is per user, so two users importing identical rows both succeed.
- Default category rules need seeding per user (sign-up hook) or a built-in fallback set in code.
- Sign-up is currently open; restrict it (`disableSignUp`) once the first account exists if the app stays single-user.

---

## Key Views

- **Balance summary** — Total income, total expenses, net for the selected period
- **Transaction list** — Sortable, searchable, category badge per row, inline category override
- **Income vs expenses** — Monthly grouped bar chart
- **Monthly spending breakdown** — By category, filterable by month
- **Import screen** — Drag-and-drop CSV, preview, confirm, shows new vs skipped rows
- **Category rules** — Settings screen to list, search, filter by category, add, edit and delete operator rules (the form, the per-rule actions and the delete confirmation are all drawers; the form shows a live match preview)

All views share a global month/year filter.

---

## Categorisation

Transactions are categorised on import using a simple rule system. Full spec in `docs/category-rules.md`.

1. A rule is `description <operator> pattern → category`. Operators: `contains`, `equals`, `starts with`, `ends with`, all case-insensitive (no regex)
2. The `description` field is matched against all of the user's rules
3. If several rules match, the most specific wins: operator strength (`equals` > `starts with` / `ends with` > `contains`), then longer pattern, then oldest rule. There is no priority column or manual ordering
4. If no rule matches, the transaction becomes `other` (or `income` for credits)
5. The user can manually override any transaction's category inline in the transaction list. This sets `categorySource = manual`, and the app offers to create a rule from it
6. The new-rule form previews what an unsaved rule matches (`GET /api/category-rules/preview`: count plus one entry per distinct description). "Save & apply" saves the rule and applies it to existing transactions, skipping manual overrides. This replaces a global "re-categorise all" action
7. The matcher lives in `packages/shared` so the backend (import) and frontend (review preview) share it

**Categories:** fixed list for now (Housing, Food, Transport, Entertainment, Health, Shopping, Income, Other), stored by key (`food`). User-defined categories are a later stage; rules reference keys, so the matcher won't change.

---

## AI Analysis

No AI API integration. Instead, the app has a **"Copy for AI" button** that formats a text summary of the selected month and copies it to the clipboard. The user pastes it into any AI chat for analysis.

The summary includes:

```
Period: September 2026
Total income:  €3,400
Total expenses: €2,847
Net: +€553

Spending by category:
  Housing       €950   (33%)
  Food          €420   (15%)
  Transport     €180   (6%)
  Shopping      €340   (12%)
  Entertainment €210   (7%)
  Other         €747   (26%)

vs. previous month:
  Food        +12%
  Shopping    +34%
  Transport   -8%

Largest transactions:
  01-09-2026  Huur           -€950
  08-09-2026  Albert Heijn   -€187
  ...
```

This approach requires no credentials, works with any AI tool, and has zero running cost.

---

## MVP Phases

| Phase | Focus | Est. time |
|---|---|---|
| 1 | Project setup — monorepo, Vite + Vue frontend, Hono backend | ~2h |
| 2 | Auth & backend (better-auth + Hono + Drizzle + D1) | ~3h |
| 3 | CSV import pipeline + deduplication | ~4h |
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy backend to Cloudflare Workers + frontend to Pages | ~2h |

Full phase breakdown with individual tasks is in `finance-app-roadmap.docx`.

---

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Data source | ING CSV (manual monthly) | No personal API available; manual step is ~30 seconds |
| Cross-platform | PWA | Single Vue codebase, installable from the browser on desktop and mobile |
| Frontend framework | Vite + Vue 3 | Nuxt dropped — no SSR needed, less complexity |
| Backend framework | Hono | Lightweight API layer, already familiar, native Workers runtime fit |
| Auth | better-auth | Already familiar; Kysely/D1-compatible adapter, single user |
| Database | Cloudflare D1 | Switched from Neon — removes Hyperdrive, single-provider stack, native Workers binding |
| ORM | Drizzle ORM | Already familiar; SQLite dialect for D1, type-safe, good migration story |
| Backend deployment | Cloudflare Workers | Free tier, native fit for Hono; Fly.io/Railway lost free tiers, Render has cold starts |
| AI integration | Copy-for-AI button | No API costs, no credentials, works with any AI tool |
| Translations | Paraglide JS, no locale in the URL | Type-safe compiled messages; locale comes from `localStorage`, then the browser language, then `en`, so routes stay unchanged |
| Categorisation | Operator rules (contains / equals / starts with / ends with) + manual override | Simple, transparent, user-controlled; most specific rule wins so there is no ordering to manage |

---

## Post-MVP Ideas

- Budget goals per category with progress indicators
- Recurring transaction detection (subscriptions, rent)
- Multiple account support (savings + checking)
- Export to PDF for tax purposes
- Dark mode toggle
- Spending spike notifications
- Additional bank parsers (ABN AMRO, Rabobank)
