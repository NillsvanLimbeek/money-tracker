# Feature component inventory

A feature is currently a page in `frontend/src/pages/`. This lists which components in `frontend/src/components/` belong to each feature, traced through nested usage (a component used by `RuleRow` counts for the page that renders `RuleRow`).

All 42 components are reachable from a page or from `App.vue`; none are orphaned.

## Migration status

Features live in `frontend/src/features/<name>/`, with `components/`, `utils/`, `constants/` and so on inside. The page itself stays in `src/pages/` because the router builds routes from that folder.

| Feature | Status |
|---|---|
| Import | **Done** (commit `cbcd31b`) |
| Rules | **Done** |
| Transactions | **Done** |
| Settings | **Done** |
| Auth | To do |
| Insights, budgets | No feature code, only shared components |

What the import migration changed:
- **Moved into `features/import/`:**
  - Components: `ImportDescription`, `ImportFilePicker`, `ImportReview`, `ImportSummary`, `Stepper`, `StatStrip`.
  - Utils: `parse-ing-csv`, `import-row-to-transaction`, `group-rows-by-month`, `format-period`.
  - Constants: `banks`.
  - Each of `utils/` and `constants/` has its own `index.ts` barrel; import code from `@/features/import/utils` and `@/features/import/constants`.
- **Transactions migration (`features/transactions/`):**
  - Components: `CategoryDrawer`, `MonthSummary`, `RulePromptDrawer`, `SearchFilterSelection`, `TransactionList`.
  - Utils: `filter-transactions`, `group-transactions`, `day-label`, `is-selected`.
  - Composable: `use-month-totals`. Type: `TransactionFilters`.
  - Each has its own barrel (`utils/`, `composables/`, `types/`).
  - Stayed shared: `TransactionRow` (with `CategoryBadge`, `CategoryPicker`, `TransactionDescription` and `split-notes`) because import uses it, `Box` and `CurrencyAmount` (generic UI, `MonthSummary` imports them from `components/`), `MonthPicker`/`MonthPickerDrawer`, `QueryBoundary`, `PageHeader`, `stores/date`, and the API queries.
- **Rules migration (`features/rules/`):**
  - Components: `Chip`, `RuleForm`, `RuleGroup`, `RuleRow`, `RuleActions`, `RuleDeleteDrawer`, `RulesEmptyState`, `AppDrawer`, `CategorySelect`, `RulePreview`. The last three were only used by `RuleForm`.
  - Utils: `group-rules-by-category`. Constants: `rule-fields`. Types: `RuleDraft`, `RuleFieldConfig` (`types/RuleField.ts`).
  - Stayed shared: `validate-rule`, plus `constants/rule-operators` and `constants/rule-validation` (which `validate-rule` imports, so they cannot depend on a feature), `CategoryBadge`, `constants/drawer-ui`, `constants/categories` and the `category-rules` API.
  - The page is `pages/settings/rules.vue`.
- **Settings migration (`features/settings/`):**
  - Components: `OptionDrawer`, `SegmentedControl`, `SettingsRow`, `SettingsSection`.
  - Constants: `date-format-options`, `language-options`, `number-format-options`.
  - Stayed shared: `use-preferences` (used by `format-currency` and `format-date`) and the `DateFormat` and `NumberFormat` types it depends on.
  - The page is `pages/settings/index.vue`.
- **Import types stayed shared:** `ImportRow` and `ImportSummary` are back in `lib/types` because the API layer (`transactions.api`, `transactions.queries`, `routes-post`) uses them, and shared code may not import from a feature.
- **Component auto-import:** `vite.config.ts` passes `components.dirs: ['src/components', 'src/features/*/components']` to the Nuxt UI plugin, so moved components still register without explicit imports. A new feature needs no config change.
- **Lint rules:** see "Dependency rules" at the bottom.
- **Docs:** `context/project-status.md` paths were updated.

## Per feature (before migration)

The lists below describe where components lived before the migration. Import's components are now under `features/import/components/`.

### `index.vue` (transactions, migrated to `features/transactions/`)
- `CategoryDrawer`
- `MonthSummary` (uses `Box`, `CurrencyAmount`)
- `RulePromptDrawer`
- `SearchFilterSelection`
- `TransactionList` (uses `TransactionRow`; `TransactionRow` uses `TransactionDescription`, `CategoryPicker`, `CategoryBadge`)
- Shared with other features: `MonthPicker`, `MonthPickerDrawer`, `QueryBoundary`, `PageHeader`

### `import.vue` (migrated to `features/import/`)
- `ImportDescription`
- `ImportFilePicker`
- `ImportReview` (uses `StatStrip`, `TransactionRow`)
- `ImportSummary` (uses `StatStrip`)
- `Stepper`
- Shared with other features: `PageHeader`, `TransactionRow` (from transactions)

### `settings/rules.vue` (migrated to `features/rules/`)
- `Chip`
- `RuleForm` (uses `AppDrawer`, `CategorySelect`, `RulePreview`)
- `RuleGroup` (uses `RuleRow`; `RuleRow` uses `RuleActions`, `RuleDeleteDrawer`)
- `RulesEmptyState`
- Shared with other features: `CategoryBadge` (from transactions), `QueryBoundary`, `PageHeader`

### `settings/index.vue` (migrated to `features/settings/`)
- `OptionDrawer`
- `SegmentedControl`
- `SettingsRow`
- `SettingsSection`
- Shared with other features: `PageHeader`

### `signin.vue` and `signup.vue`
- `AuthFormField`
- `AuthTabs`

### `insights.vue`
- Only shared components: `MonthPicker`, `MonthPickerDrawer`, `PageHeader`

### `budgets.vue`
- Only `PageHeader`

### `App.vue` (app shell, not a page)
- `BottomNav`
- `DesktopBlocker`

## Used by more than one feature

| Component | Used by |
|---|---|
| `PageHeader` | all 6 pages that have a header |
| `QueryBoundary` | transactions, rules |
| `MonthPicker`, `MonthPickerDrawer` | transactions, insights |
| `TransactionRow` (with `CategoryBadge`, `CategoryPicker`, `TransactionDescription`) | transactions, import |
| `CategoryBadge` | transactions, rules |

## Open decisions for the migration

- **Shared:** `PageHeader`, `QueryBoundary`, `MonthPicker`, `MonthPickerDrawer`.
- **Transaction components:** `TransactionRow` and its children are used by transactions and import. Features cannot import each other (lint rule), so these must stay in shared `components/` (or move to a shared folder). They cannot move into the transactions feature while import uses them. `ImportReview` keeps using `TransactionRow` from `components/`.
- **Generic UI:** `Box`, `Chip`, `CurrencyAmount`, `AppDrawer`, `SegmentedControl` each have a single consumer today (`StatStrip` already moved into the import feature). Put them in a shared `ui/` folder, or keep them with their one feature until a second consumer appears.
- **Settings:** settings and rules are separate pages. They could be separate features or one `settings` feature; they share nothing besides `PageHeader`.
- **App shell:** `BottomNav` and `DesktopBlocker` belong to no page; put them in shared or a layout folder.
- **Later:** `lib/api`, `lib/utils` and `lib/types` could follow the same feature split.

## Where each non-component file would go

Based on who actually imports each file today (searched by exported symbol across `.vue` and `.ts`, specs excluded). Name matching is by word, so very generic type names such as `Category` and `Transaction` may over-count slightly.

### Import (done, now in `features/import/`)
| File | Consumers |
|---|---|
| `utils/parse-ing-csv` | `ImportReview`, `import.vue`, `constants/banks` |
| `utils/import-row-to-transaction` | `ImportReview` |
| `utils/group-rows-by-month` | `ImportReview` |
| `utils/format-period` | `ImportSummary` (import-only today, despite the generic name) |
| `constants/banks` | `ImportFilePicker`, `import.vue` |

Stays in shared `lib/types` because the API layer uses them: `types/ImportRow`, `types/ImportSummary`.

### Rules (done, now in `features/rules/`; `rule-operators` and `rule-validation` stayed shared because `validate-rule` uses them)
| File | Consumers |
|---|---|
| `utils/group-rules-by-category` | `RuleGroup`, `rules.vue` |
| `constants/rule-fields` | `RuleForm` |
| `constants/rule-validation` | `validate-rule` |
| `constants/rule-operators` | `RuleActions`, `RuleRow`, `rule-fields`, `validate-rule` |
| `types/RuleField` | `RuleForm`, `rule-fields` |

### Transactions (done, now in `features/transactions/`)
| File | Consumers |
|---|---|
| `utils/filter-transactions` | `index.vue` |
| `types/TransactionFilters` | `filter-transactions` |
| `utils/group-transactions` | `TransactionList` |
| `utils/day-label` | `group-transactions` only |
| `composables/use-month-totals` | `index.vue` |
| `utils/is-selected` | `CategoryDrawer`, `index.vue` |
| `utils/split-notes` | `TransactionRow` (moves with `TransactionRow`, wherever that ends up) |

### Settings (done, now in `features/settings/`; the `DateFormat` type stayed shared because `use-preferences` uses it)
| File | Consumers |
|---|---|
| `constants/date-format-options` | `settings/index.vue` |
| `constants/language-options` | `settings/index.vue` |
| `constants/number-format-options` | `settings/index.vue` |
| `types/DateFormat` | `use-preferences`, `date-format-options` |

### Auth
| File | Consumers |
|---|---|
| `constants/sign-in-fields`, `constants/sign-up-fields` | `signin.vue`, `signup.vue` |
| `models/sign-in`, `models/sign-up` | the pages and the field constants |
| `types/FormField` | the two field constants |
| `auth-client` | `stores/auth` |
| `stores/auth` | `signin.vue`, `signup.vue` |

### App shell
| File | Consumers |
|---|---|
| `constants/nav-items`, `types/NavItem` | `BottomNav` |

### Shared (used by more than one feature)
| File | Consumers |
|---|---|
| `utils/format-currency` | `CurrencyAmount`, `ImportReview`, `ImportSummary`, `RulePreview`, `TransactionList`, `TransactionRow` |
| `utils/format-date` | `RulePreview`, `TransactionRow`, `day-label` |
| `utils/date-fns-locale` | `MonthPicker`, `MonthPickerDrawer`, `TransactionRow`, several utils |
| `utils/validate-rule` | `RuleForm` (rules) and `RulePromptDrawer` (transactions) |
| `composables/use-preferences` | `format-currency`, `format-date`, `settings/index.vue` |
| `types/NumberFormat` | `use-preferences`, `format-currency`, `number-format-options` |
| `constants/categories`, `types/Category` | transactions, rules, import components, `validate-rule` |
| `types/CategoryRule` | rules components, `ImportReview`, `RulePromptDrawer` |
| `types/Transaction`, `types/ApiTransaction` | transactions, import, api |
| `constants/drawer-ui` | six drawer components across features |
| `api/category-rules/*queries` | import, transactions, settings, rules |
| `api/transactions/*` | transactions, insights, import |
| `api/client/*`, `api/health/*` | infrastructure |
| `stores/date` | `index.vue`, `insights.vue` |

### Corrections to the earlier guess
- `use-preferences` is not settings-only: `format-currency` and `format-date` call it, so it stays shared.
- `validate-rule` is not rules-only: `RulePromptDrawer` is rendered on the transactions page.
- `format-period` is generic by name but only `ImportSummary` uses it.
- The `category-rules` and `transactions` API folders cannot move wholesale into one feature. Their queries are used by three or four features, so keep the data layer shared or split it per query file.

## Dependency rules (enforced by ESLint)

Configured in `frontend/eslint.config.js` with `no-restricted-imports`:

- Code outside `src/features/` and `src/pages/` (so `lib`, `components`, `stores`) cannot import from a feature, via `@/features/...` or a relative path. Anything the shared layer needs, such as the import types used by the API layer, must live in shared code.
- A feature cannot import from another feature. Once two features need the same code, move it to `lib` or `components`. The list of features is read from the folders in `src/features/`, so new features are covered automatically (the rule only has an effect once there are two).
- `src/pages/` may import from features; a page is the entry point that composes its feature.
- Component auto-import also scans `src/features/*/components` (see `vite.config.ts`), so component names must stay unique across the app.
