import pluginVue from 'eslint-plugin-vue';

export default [
  // Ignore build output
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Vue 3 — essential + strongly-recommended logical rules (no opinionated formatting)
  ...pluginVue.configs['flat/strongly-recommended'],

  // Project-wide overrides
  {
    rules: {
      // Errors
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

      // Warnings
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],

      // Vue: allow single-word component names (e.g. <Home>)
      'vue/multi-word-component-names': 'off',

      // Vue: allow v-html (we control the content)
      'vue/no-v-html': 'warn',

      // Vue: component options order (script setup doesn't need this)
      'vue/component-api-style': ['error', ['script-setup', 'composition']],

      // Formatting — handled by Prettier if needed; disable noisy rules
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/attributes-order': 'off',
    },
  },
];
