import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import tsEslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser'

const baseConfig = {
  ignores: ['eslint.config.mjs'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: true,
      sourceType: 'commonjs',
      ecmaVersion: 'latest',
    },
  },
}

export default tsEslint.config(
  {
    name: 'Code / Typescript configuration',
    ...baseConfig,
    ignores: ['dist/*', 'eslint.config.mjs', 'src/_legacy/**'],
    extends: [eslint.configs.recommended, tsEslint.configs.strictTypeChecked],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        sourceType: 'commonjs',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'no-unused-vars': 0,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-empty-function': 0,
      '@typescript-eslint/no-empty-function': 0,
      semi: [1, 'never'],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'no-useless-escape': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-unsafe-function-type': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNever: true,
        },
      ],
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 0,
      '@typescript-eslint/no-base-to-string': 0,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 0,
      // Nest modules are idiomatically empty classes carrying only a `@Module()` decorator.
      '@typescript-eslint/no-extraneous-class': 0,
    },
  },
  {
    name: 'Import plugin configuration',
    ...baseConfig,
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      'import/named': 'off',
      'import/no-named-as-default-member': 0,
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@app/**',
              group: 'external',
              position: 'after',
            },
          ],
          distinctGroup: false,
          alphabetize: {
            order:
              'asc' /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
            caseInsensitive: true /* ignore case. Options: [true, false] */,
          },
        },
      ],
    },
  },
  {
    name: 'Prettier plugin configuration',
    ...baseConfig,
    plugins: { prettier: prettierPlugin },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
    },
  },
)
