import config from '@remcohaszing/eslint'

export default [
  ...config,
  {
    rules: {
      'no-console': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'jsdoc/check-indentation': 'off',
      'n/hashbang': 'off'
    }
  }
]
