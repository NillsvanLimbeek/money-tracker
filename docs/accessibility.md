# Accessibility (WCAG) checks

Three layers, all run from `frontend/`:

| Layer | Command | What it catches |
| --- | --- | --- |
| ESLint (`eslint-plugin-vuejs-accessibility`) | `pnpm lint` | Static template issues: missing alt/labels, click handlers without keyboard support, invalid ARIA |
| Storybook a11y panel (`@storybook/addon-a11y`) | `pnpm storybook` | axe results per story, interactively (Accessibility tab) |
| Storybook + Vitest (`@storybook/addon-vitest`) | `pnpm test:a11y` (or `pnpm test:a11y` from the repo root) | Runs every story in headless Chromium and applies axe, using WCAG 2.0/2.1/2.2 A + AA and best-practice rules |

First run needs the browser: `pnpm exec playwright install chromium`.

## Strictness

`.storybook/preview.ts` sets `parameters.a11y.test: 'error'`: any axe violation fails the story.
Opt a single story or component out with `parameters: { a11y: { test: 'todo' } }` (report only) or `'off'`.

## Conventions that keep it green

- Text colors: use the semantic tokens (`text-muted`, `text-error`, ...). They are tuned for 4.5:1 in `src/assets/main.css`.
  Do not fade text with `opacity-*`; switch it to `text-muted` and fade only graphics.
- Drawers: give `UDrawer` a `title` (use the `#actions` slot for buttons next to it) so the dialog has a name.
- Scrollable areas need `tabindex="0"` so keyboard users can scroll them.
- Stories must import Nuxt UI components (e.g. `@nuxt/ui/components/Button.vue`) when used in a runtime template.

## Known gap

`TransactionRow` expands on mouse click only (lint rules disabled for that file in `eslint.config.js`).

Automated checks only cover roughly a third of WCAG; keyboard and screen-reader passes are still manual.
