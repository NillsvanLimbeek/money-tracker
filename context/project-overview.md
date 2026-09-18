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

**Backend**

No custom backend — the frontend talks to [Neon](https://neon.tech) directly.

| Layer | Choice | Notes |
|---|---|---|
| API | Neon Data API | PostgREST-style REST over Postgres, generated from the schema, no server to write or host |
| Auth | Neon Managed Better Auth | Hosted auth (built on Better Auth), issues JWTs the Data API validates natively |
| Access control | Postgres Row-Level Security | Policies keyed on `auth.user_id()` (JWT `sub` claim) — each user only ever sees their own rows |
| Database | PostgreSQL (Neon, `aws-eu-central-1`) | Serverless, autoscaling, branchable; project `money-tracker` |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Neon (aws-eu-central-1)            │
│   Managed Better Auth  →  neon_auth schema (JWTs)   │
│   Data API  →  REST over public schema              │
│             →  Postgres RLS (auth.user_id())        │
└─────────────────────────────────────────────────────┘
          ↑                 ↑               ↑
    PWA (browser)   Desktop (Tauri)  Mobile (Tauri)
          ↑                 ↑               ↑
┌─────────────────────────────────────────────────────┐
│        Vite + Vue 3 + TypeScript                    │
│        (static build, no SSR)                       │
└─────────────────────────────────────────────────────┘
```

There is no `backend/` package. The Vue app calls the Neon Data API directly from the browser (`@neondatabase/neon-js`), authenticated via Managed Better Auth. Postgres Row-Level Security enforces that a signed-in user can only read/write their own `transactions` and `category_rules` rows — there's no application-layer authorization code to write or audit.

**Infrastructure:**

- **Neon project `money-tracker`**, region `aws-eu-central-1` (Frankfurt, GDPR) — Postgres, Managed Better Auth, and the Data API all live on the same branch and scale/branch together
- Static frontend build served the same way regardless of host (Tauri bundle or any static host/PWA) — no server-side deploy step

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

`user_id` on both tables defaults to `auth.user_id()` (the signed-in user's id, from the JWT) rather than being set by application code — RLS policies use it to scope every read/write to the current user.

### `transactions`

```ts
interface Transaction {
  id: string; // uuid PK
  user_id: string; // FK to auth user
  date: string; // ISO date, parsed from YYYYMMDD
  description: string; // Naam / Omschrijving
  amount: number; // Negative = expense, positive = income
  category: string; // Auto-assigned or manually overridden
  raw_counterparty: string; // Tegenrekening IBAN
  mutation_type: string; // MutatieSoort
  import_hash: string; // For deduplication
  created_at: string; // Timestamptz
}
```

### `category_rules`

```ts
interface CategoryRule {
  id: string;
  keyword: string; // Matched against description (case-insensitive)
  category: string; // Category to assign on match
  priority: number; // Higher = evaluated first
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
| 1 | Project setup — Vite + Vue frontend | ~2h |
| 2 | Neon setup (Data API + Managed Better Auth, schema + RLS) & signin/signup UI | ~2h |
| 3 | CSV import pipeline + deduplication | ~4h |
| 4 | Dashboard views + charts | ~5h |
| 5 | Categorisation management UI | ~2h |
| 6 | AI analysis export (copy button) | ~1h |
| 7 | Deploy static frontend build + Tauri builds | ~2h |

Full phase breakdown with individual tasks is in `finance-app-roadmap.docx`.

---

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Data source | ING CSV (manual monthly) | No personal API available; manual step is ~30 seconds |
| Cross-platform | Tauri 2.0 | Single Vue codebase, small binary, covers desktop + mobile + PWA |
| Frontend framework | Vite + Vue 3 | Nuxt dropped — no SSR needed, cleaner Tauri fit, less complexity |
| Backend | Neon Data API (no custom backend) | Single-user CRUD app — CSV parsing and categorisation already run client-side, so a REST layer generated from the schema is enough; nothing to deploy or maintain |
| Auth | Neon Managed Better Auth | Hosted, branch-aware, JWTs work natively with the Data API and RLS; no auth server to run |
| Database | PostgreSQL (Neon, `aws-eu-central-1`) | GDPR region matches the original Hetzner choice; traded self-hosting for zero ops — RLS keeps rows isolated per user even though Neon (not us) hosts the data |
| Deployment | None (serverless) | Static frontend build only; Neon handles the backend, no VPS/PaaS to run |
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
