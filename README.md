# money-tracker

A personal finance tracker for importing, categorising and analysing ING bank
transactions. Built for one user and used in the browser on a phone.

More background lives in [`context/project-overview.md`](context/project-overview.md),
and progress in [`context/project-status.md`](context/project-status.md).

## Structure

pnpm workspace:

| Folder | What it is |
|---|---|
| `frontend/` | Vue 3 + Vite + TypeScript SPA (Nuxt UI, Pinia, TanStack Query, Paraglide i18n, Storybook) |
| `backend/` | Cloudflare Worker with Hono, Drizzle and better-auth, on a D1 (SQLite) database |
| `packages/shared/` | Types and schemas shared by both |
| `docs/` | Reports and feature notes |

## Requirements

- Node `^22.18.0` or `>=24.12.0`
- [pnpm](https://pnpm.io)

## Local development

```sh
pnpm install

# Backend config (wrangler.toml is gitignored)
cp backend/wrangler.toml.example backend/wrangler.toml
echo 'BETTER_AUTH_SECRET=<any-long-random-string>' > backend/.env

# Frontend config
cp frontend/.env.example frontend/.env.local

# Create the local D1 tables
pnpm -C backend db:migrate:local

# Start frontend (http://localhost:5173) and backend (http://localhost:8787)
pnpm dev
```

## Scripts

Run from the repo root.

| Command | Does |
|---|---|
| `pnpm dev` | Frontend and backend together |
| `pnpm build` | Type-check and build the frontend |
| `pnpm lint` / `pnpm lint:fix` | ESLint in every package |
| `pnpm type-check` | Type-check every package |
| `pnpm test:unit` | Frontend unit tests (Vitest) |
| `pnpm -C backend test:unit` | Backend tests (Vitest + Workers pool) |
| `pnpm test:a11y` | Storybook stories run in a real browser with axe checks |
| `pnpm test:e2e` | Playwright end-to-end tests (`pnpm -C frontend exec playwright install` first) |
| `pnpm -C frontend storybook` | Storybook on port 6006 |
| `pnpm -C backend db:generate` | Generate a Drizzle migration after a schema change |

Some files are generated and gitignored (`frontend/src/paraglide`,
`auto-imports.d.ts`, `components.d.ts`, `typed-router.d.ts`). `pnpm type-check`
and `pnpm dev` create them, so run one of those first if your editor reports
missing modules.

## Deployment

Everything runs on Cloudflare. One Worker serves both the API (`/api/*`) and the
built frontend as static assets, so the app and API share an origin. That keeps
the auth cookie first-party, which iOS Safari requires, and avoids CORS.

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) handles CI and deploys:

1. On every pull request and push to `main`, two jobs run: lint, type-check and
   unit tests, and the Storybook a11y tests.
2. When both pass on `main`, the deploy job:
   - builds the frontend,
   - writes `backend/wrangler.toml` from the example,
   - applies D1 migrations to the remote database,
   - runs `wrangler deploy`.

### One-time setup

In the GitHub repo, under Settings → Secrets and variables → Actions:

| Type | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | Token with Workers Scripts edit and D1 edit permission |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id |
| Secret | `D1_DATABASE_ID` | Id of the `money_tracker` D1 database |
| Variable | `CORS_ORIGIN` | The deployed URL, e.g. `https://money-tracker.<subdomain>.workers.dev` (no trailing slash) |

The auth secret is set once on the Worker and is not part of CI:

```sh
cd backend
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

To deploy by hand, build the frontend first (`pnpm -C frontend build`), then run
`pnpm -C backend deploy`.
