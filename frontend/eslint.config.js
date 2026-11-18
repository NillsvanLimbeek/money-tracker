import { readdirSync } from 'node:fs';
import antfu from '@antfu/eslint-config';
import vueA11y from 'eslint-plugin-vuejs-accessibility';

const features = readdirSync('src/features', { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

// Features are leaves of the dependency graph: only the matching page in
// src/pages (the feature's entry point) may import from one. Shared code in
// src/lib, src/components and src/stores must never depend on a feature.
const featureImportRules = [
  {
    // Everything outside a feature, except the pages that compose them.
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/features/**', 'src/pages/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/features/**', '**/features/**'],
          message: 'Shared code cannot import from a feature. Move the code to src/lib or src/components if it is shared.',
        }],
      }],
    },
  },
  // A feature cannot import from another feature.
  ...features.map(feature => ({
    files: [`src/features/${feature}/**/*.{ts,vue}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: features
            .filter(other => other !== feature)
            .flatMap(other => [`@/features/${other}`, `@/features/${other}/**`]),
          message: 'A feature cannot import from another feature. Move the shared code to src/lib or src/components.',
        }],
      }],
    },
  })),
].filter(config => config.rules['no-restricted-imports'][1].patterns[0].group.length > 0);

export default antfu({
  ignores: ['src/paraglide', 'project.inlang'],
  vue: true,
  typescript: true,

  stylistic: {
    quotes: 'single',
    semi: true,
  },
}, {
  rules: {
    'vue/max-attributes-per-line': 'error',
    'ts/explicit-function-return-type': ['error', { allowExpressions: true }],
  },
}, ...vueA11y.configs['flat/recommended'], {
  // TODO(a11y): the row expands on mouse click only. Replace with a real
  // <button aria-expanded> toggle (the nested checkbox rules out role=button on the row).
  files: ['src/components/transaction-row/TransactionRow.vue'],
  rules: {
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/no-static-element-interactions': 'off',
  },
}, ...featureImportRules);
