// eslint.config.js
import js from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier'

export default [
  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    plugins: {
      prettier: pluginPrettier,
    },

    rules: {
      // Prettier runs as an ESLint rule
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
        },
      ],
    },
    env: {
      node: true,
      es2021: true,
    },
  },
]
