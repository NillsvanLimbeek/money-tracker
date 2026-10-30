# shared

The `@money-tracker/shared` workspace package: code both apps need, exported as TypeScript source (no build step; Vite and Wrangler bundle it).

Currently it holds the category rule matcher (`src/match-category.ts`), used by the backend on import and when applying rules. It is also intended for the frontend's import review preview.

Run its tests with `pnpm -C packages/shared test:unit`.

## Later

The backend's Zod schemas and constants could move here once the frontend needs the same request/response shapes.
