module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'prettier', // Add prettier to the end to override other configs
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // You can add or override ESLint rules here
    // e.g., 'no-console': 'warn' to warn about console logs instead of failing
  },
};
