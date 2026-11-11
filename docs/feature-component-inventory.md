# Feature component inventory

A feature is currently a page in `frontend/src/pages/`. This lists which components in `frontend/src/components/` belong to each feature, traced through nested usage (a component used by `RuleRow` counts for the page that renders `RuleRow`).

All 42 components are reachable from a page or from `App.vue`; none are orphaned.

## Per feature

### `index.vue` (transactions)
- `CategoryDrawer`
- `MonthSummary` (uses `Box`, `CurrencyAmount`)
- `RulePromptDrawer`
- `SearchFilterSelection`
- `TransactionList` (uses `TransactionRow`; `TransactionRow` uses `TransactionDescription`, `CategoryPicker`, `CategoryBadge`)
- Shared with other features: `MonthPicker`, `MonthPickerDrawer`, `QueryBoundary`, `PageHeader`

### `import.vue`
- `ImportDescription`
- `ImportFilePicker`
- `ImportReview` (uses `StatStrip`, `TransactionRow`)
- `ImportSummary` (uses `StatStrip`)
- `Stepper`
- Shared with other features: `PageHeader`, `TransactionRow` (from transactions)

### `settings/rules.vue`
- `Chip`
- `RuleForm` (uses `AppDrawer`, `CategorySelect`, `RulePreview`)
- `RuleGroup` (uses `RuleRow`; `RuleRow` uses `RuleActions`, `RuleDeleteDrawer`)
- `RulesEmptyState`
- Shared with other features: `CategoryBadge` (from transactions), `QueryBoundary`, `PageHeader`

### `settings/index.vue`
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
- **Transaction components:** `TransactionRow` and its children are shared between transactions and import. Keep them in transactions and import from there, or promote them to shared.
- **Generic UI:** `Box`, `Chip`, `CurrencyAmount`, `AppDrawer`, `StatStrip`, `SegmentedControl` each have a single consumer today. Put them in a shared `ui/` folder, or keep them with their one feature until a second consumer appears.
- **Settings:** settings and rules are separate pages. They could be separate features or one `settings` feature; they share nothing besides `PageHeader`.
- **App shell:** `BottomNav` and `DesktopBlocker` belong to no page; put them in shared or a layout folder.
- **Later:** `lib/api`, `lib/utils` and `lib/types` could follow the same feature split.

## Where each non-component file would go

Based on who actually imports each file today (searched by exported symbol across `.vue` and `.ts`, specs excluded). Name matching is by word, so very generic type names such as `Category` and `Transaction` may over-count slightly.

### Import
| File | Consumers |
|---|---|
| `utils/parse-ing-csv` | `ImportReview`, `import.vue`, `constants/banks` |
| `utils/import-row-to-transaction` | `ImportReview` |
| `utils/group-rows-by-month` | `ImportReview` |
| `utils/format-period` | `ImportSummary` (import-only today, despite the generic name) |
| `constants/banks` | `ImportFilePicker`, `import.vue` |

Stays in shared `lib/types` because the API layer uses them: `types/ImportRow`, `types/ImportSummary`.

### Rules
| File | Consumers |
|---|---|
| `utils/group-rules-by-category` | `RuleGroup`, `rules.vue` |
| `constants/rule-fields` | `RuleForm` |
| `constants/rule-validation` | `validate-rule` |
| `constants/rule-operators` | `RuleActions`, `RuleRow`, `rule-fields`, `validate-rule` |
| `types/RuleField` | `RuleForm`, `rule-fields` |

### Transactions
| File | Consumers |
|---|---|
| `utils/filter-transactions` | `index.vue` |
| `types/TransactionFilters` | `filter-transactions` |
| `utils/group-transactions` | `TransactionList` |
| `utils/day-label` | `group-transactions` only |
| `composables/use-month-totals` | `index.vue` |
| `utils/is-selected` | `CategoryDrawer`, `index.vue` |
| `utils/split-notes` | `TransactionRow` (moves with `TransactionRow`, wherever that ends up) |

### Settings
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

- Code outside `src/features/` and `src/pages/` (so `lib`, `components`, `stores`) cannot import from a feature. Anything the shared layer needs, such as the import types used by the API layer, must live in shared code.
- A feature cannot import from another feature. Once two features need the same code, move it to `lib` or `components`.
- `src/pages/` may import from features; a page is the entry point that composes its feature.
- Component auto-import also scans `src/features/*/components` (see `vite.config.ts`), so component names must stay unique across the app.
