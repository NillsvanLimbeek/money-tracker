import antfu from '@antfu/eslint-config';

export default antfu({
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
});
