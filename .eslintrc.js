module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Make it Windows-friendly
    'linebreak-style': 'off',

    // Cyclomatic complexity - more realistic for complex operations
    complexity: ['error', { max: 10 }],

    // Additional code quality rules - relaxed for TypeScript migration
    'max-depth': ['error', 4],
    'max-lines': ['error', 400],
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'max-lines-per-function': ['error', 75],
    'max-params': ['error', 5],
    'no-console': 'off', // Allow console in CLI app
    'prefer-const': 'error',
    'no-var': 'error',

    // Disable problematic rules for TypeScript migration
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-useless-constructor': 'off',
    'no-empty-function': 'off',
    'lines-between-class-members': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'no-param-reassign': 'off',
    'no-await-in-loop': 'off',
    'consistent-return': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['airbnb-base', 'prettier'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'error',

        // Disable conflicting rules
        'no-unused-vars': 'off',
        'import/extensions': 'off', // Disable for TypeScript

        // Windows-friendly
        'linebreak-style': 'off',

        // Keep quality rules - relaxed for complex operations
        complexity: ['error', { max: 15 }], // Increased for complex operations
        'max-depth': ['error', 4],
        'max-lines': ['error', 400],
        'max-len': ['error', { code: 120, ignoreComments: true }],
        'max-lines-per-function': ['warn', 100], // Changed to warning and increased limit
        'max-params': ['warn', 6], // Changed to warning and increased limit for error constructors
        'max-classes-per-file': 'off', // Allow multiple related classes per file
        'prefer-const': 'error',

        // Disable problematic rules for TypeScript migration
        'import/no-unresolved': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'no-useless-constructor': 'off',
        'no-empty-function': 'off',
        'lines-between-class-members': 'off',
        'no-use-before-define': 'off',
        'no-shadow': 'off',
        'no-param-reassign': 'off',
        'no-await-in-loop': 'off',
        'consistent-return': 'off',
        'no-console': 'off',
        'implicit-arrow-linebreak': 'off',
        'default-param-last': 'off', // Allow default params for TypeScript constructors
      },
    },
  ],
};
