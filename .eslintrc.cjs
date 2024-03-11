module.exports = {
  root: true,
  env: {
    es2021: true
  },
  extends: ['prettier', 'eslint:recommended', 'plugin:import/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true
    },
    ecmaVersion: 12,
    requireConfigFile: false
  },
  plugins: ['prettier'],
  rules: {
    'no-undef': 'off',
    'no-param-reassign': 'off',
    'import/order': 1,
    'import/no-cycle': 'off',
    'no-console': 'off',
    'prefer-destructuring': 'off',
    'no-shadow': 'off',
    'import/no-named-as-default': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: false
      }
    ],
    'prettier/prettier': [
      'warn',
      {
        bracketSpacing: true,
        printWidth: 140,
        singleQuote: true,
        trailingComma: 'none',
        tabWidth: 2,
        useTabs: false,
        endOfLine: 'auto'
      }
    ]
  }
};
