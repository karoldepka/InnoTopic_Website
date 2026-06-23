const { defineConfig } = require('eslint/config');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    ignores: ['projects/**/*'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['Page', 'Component'],
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
    ],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
]);
