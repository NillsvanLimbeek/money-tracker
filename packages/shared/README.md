# shared

Placeholder for a future `@money-tracker/shared` workspace package.

## Why

The backend defines Zod schemas (`backend/src/schemas/`) and constants (`backend/src/constants/`) for transactions. The frontend will need the same request/response shapes and validation rules. Duplicating them means they drift apart; importing across app directories with relative paths fights the tooling.

A shared package gives one source of truth that both `frontend` and `backend` depend on.

## When to create it

Not yet. Once the frontend first needs a type or schema from the backend:

1. Add a `package.json` here (`name: "@money-tracker/shared"`, `private: true`, `type: "module"`), exporting the TypeScript source directly (no build step; Vite and Wrangler both bundle it).
2. Move the Zod schemas and shared constants here.
3. Add `"@money-tracker/shared": "workspace:*"` to the `frontend` and `backend` dependencies and run `pnpm install`.

This folder is already covered by the `packages/*` glob in `pnpm-workspace.yaml`.
