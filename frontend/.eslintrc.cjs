module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended', // Forces editor to flag missing useEffect/useCallback dependencies
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'tailwind.config.js', 'postcss.config.js', 'playwright.config.ts'],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-irregular-whitespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  },
}