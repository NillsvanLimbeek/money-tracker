# Personal Finance App — Project Overview

> A personal finance tracker for importing, categorising, and analysing ING bank transactions. Not a SaaS — built for one user, runs on desktop, mobile, and in the browser from a single codebase.

---

## Goals

- Import monthly CSV exports from ING and see a clear picture of income vs expenses
- Categorise transactions automatically (keyword rules) with the option to override manually
- View spending by category and month-over-month trends
- Get occasional AI-assisted analysis by copying a formatted summary into any AI chat
- Access the app on any device: browser, desktop, and phone

---

## Tech Stack

**Frontend (`frontend/`)**

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vite + Vue 3 + TypeScript | Lightweight, native Tauri fit, no SSR overhead |
| Routing | Vue Router | File-based routing via `unplugin-vue-router` |
| State management | Pinia | Transactions, filters, UI state |
| Desktop + mobile | Tauri 2.0 | Windows, macOS, Linux, iOS, Android |
| PWA | `vite-plugin-pwa` | Installable from the browser |
| Charts | vue-chartjs | Chart.js wrapper for Vue |

**Backend (`backend/`)**

| Layer | Choice | Notes |
|---|---|---|
| Framework | Hono | Lightweight, fast, already familiar |
| Auth | better-auth | Hono adapter, single user |
| ORM | Drizzle ORM | Type-safe queries, migrations, already familiar |
| Database | Neon | Serverless Postgres, switched from self-hosted during Claude Code session |
| Deployment | Cloudflare Workers | Free tier, native Hono runtime fit, pairs well with Neon via Hyperdrive |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│         backend/  —  Hono on Cloudflare Workers       │
│   Hono API  →  better-auth                          │
│             →  /api/transactions                    │
│             →  Drizzle ORM → Hyperdrive → Neon      │
└──────────────────────────────────────────────────────┘
          ↑                 ↑               ↑
    PWA (browser)   Desktop (Tauri)  Mobile (Tauri)
          ↑                 ↑               ↑
┌──────────────────────────────────────────────────────┐
│        frontend/  —  Vite + Vue 3 + TypeScript       │
│        (static build — served separately or Tauri)   │
└──────────────────────────────────────────────────────┘
                                  ↕
                    ┌─────────────────────────┐
                    │  Neon (serverless Postgres) │
                    └─────────────────────────┘
```

The monorepo has two packages with a clean separation:

- **`frontend/`** — Vite + Vue 3 app. Compiled to static files for Tauri (desktop/mobile) and served as a PWA in the browser. Talks to the backend exclusively via REST API calls.
- **`backend/`** — Hono app deployed as a Cloudflare Worker. Handles auth (better-auth), all API routes, and database access via Drizzle + Neon. Shared by all three clients.

**Infrastructure:**

- **Neon** — Serverless Postgres. Switched from self-hosted PostgreSQL on Hetzner during the Claude Code session. Backups are managed by Neon automatically.
- **Cloudflare Workers** — Hosts the Hono backend. Hono was built for the Workers runtime natively (Fetch API-based, no Node-specific APIs), so this is a clean fit with no compatibility shims needed. Free tier is generous; paid tier is $5/month if usage grows beyond it.
- **Hyperdrive** — Cloudflare's connection pooler for reaching Neon from a Worker. Configured once, then Drizzle connects through it like a normal Postgres connection string.

Chosen over Fly.io, Railway, and Render because: Fly.io no longer offers a free tier for new accounts, Railway's free tier is now a small one-time trial credit rather than ongoing, and Render's free tier has cold starts on traditional Node servers. Cloudflare Workers avoids all three issues and is the runtime Hono is actually designed for.

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

**Parsing gotchas:**

- Encoding is **Windows-1252**, not UTF-8 — use `TextDecoder('windows-1252')` in the browser
- `Bedrag` is always positive — check `Af Bij` for the sign
- Decimal separator is a **comma** — replace before `parseFloat`
- Deduplication uses a hash of `date + amount + description` to prevent double-importing the same rows

---

## Data Model

### `transactions`

```ts
type Transaction = {
  id: string              // uuid PK
  user_id: string         // FK to auth user
  date: string            // ISO date, parsed from YYYYMMDD
  description: string     // Naam / Omschrijving
  amount: number          // Negative = expense, positive = income
  category: string        // Auto-assigned or manually overridden
  raw_counterparty: string // Tegenrekening IBAN
  mutation_type: string   // MutatieSoort
  import_hash: string     // For deduplication
  created_at: string      // Timestamptz
}
```

### `category_rules`

```ts
type CategoryRule = {
  id: string
  keyword: string    // Matched against description (case-insensitive)
  category: string   // Category to assign on match
  priority: number   // Higher = evaluated first
}
```

---

## Key Views

- **Balance summary** — Total income, total expenses, net for the selected period
- **Transaction list** — Sortable, searchable, category badge per row, inline category override
- **Income vs expenses** — Monthly grouped bar chart
- **Monthly spending breakdown** — By category, filterable by month
- **Import screen** — Drag-and-drop CSV, preview, confirm, shows new vs skipped rows
- **Category rules** — Manage keyword-to-category mappings

All views share a global month/year filter.

---

## Categorisation

Transactions are categorised on import using a simple keyword rule system:

1. The `description` field is matched against all rules (case-insensitive)
2. The highest-priority matching rule wins
3. If no rule matches, the transaction is marked as `Other` (or `Income` if `Af Bij` is `Bij`)
4. The user can manually override any transaction's category inline in the transaction list
5. A "re-categorise all" action re-runs the rules against existing transactions

**Default categories:** Housing, Food, Transport, Entertainment, Health, Shopping, Income, Other

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
  2026-09-01  Huur           -€950
  2026-09-08  Albert Heijn   -€187
  ...
```

This approach requires no credentials, works with any AI tool, and has zero running cost.

---

## MVP Phases

| Phase | Focus | Est. time |
|---|---|---|
| 1 | Project setup — monorepo, Vite + Vue frontend, Hono backend | ~2h |
| 2 | Auth & backend (better-auth + Hono + Drizzle + Postgres) | ~3h |
| 3 | CSV import pipeline + deduplication | ~4h |
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy backend to Cloudflare Workers + Tauri builds | ~2h |

Full phase breakdown with individual tasks is in `finance-app-roadmap.docx`.

---

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Data source | ING CSV (manual monthly) | No personal API available; manual step is ~30 seconds |
| Cross-platform | Tauri 2.0 | Single Vue codebase, small binary, covers desktop + mobile + PWA |
| Frontend framework | Vite + Vue 3 | Nuxt dropped — no SSR needed, cleaner Tauri fit, less complexity |
| Backend framework | Hono | Lightweight API layer, already familiar, great better-auth adapter |
| Auth | better-auth | Already familiar; Hono adapter, single user |
| Database | Neon (serverless Postgres) | Switched from self-hosted during Claude Code session; simpler ops, automatic backups |
| ORM | Drizzle ORM | Already familiar; type-safe, lightweight, good migration story |
| Backend deployment | Cloudflare Workers | Free tier, native fit for Hono's Fetch API design; Fly.io/Railway lost their free tiers, Render has cold starts |
| AI integration | Copy-for-AI button | No API costs, no credentials, works with any AI tool |
| Categorisation | Keyword rules + manual override | Simple, transparent, user-controlled |

---

## Post-MVP Ideas

- Budget goals per category with progress indicators
- Recurring transaction detection (subscriptions, rent)
- Multiple account support (savings + checking)
- Export to PDF for tax purposes
- Dark mode toggle
- Spending spike notifications
- Additional bank parsers (ABN AMRO, Rabobank)
