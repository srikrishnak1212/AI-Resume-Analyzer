module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React — enforce project rules (PROJECT_RULES.md)
    'react/prop-types': 'warn',
    'react/display-name': 'off',
    'react/no-array-index-key': 'warn',

    // Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Code quality
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',

    // No inline styles — enforced per PROJECT_RULES.md
    'react/forbid-component-props': [
      'warn',
      { forbid: [{ propName: 'style', message: 'Use Tailwind classes instead of inline styles (PROJECT_RULES.md).' }] },
    ],
  },
};
