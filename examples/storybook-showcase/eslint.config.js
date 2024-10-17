import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  { ignores: ['dist', '.yalc'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'indent': ['error', 2, {
        SwitchCase: 1,
      }],
      'curly': 'error', // enforce braces for one-line blocks
      'no-tabs': 'error', // enforce no tabs
      'no-console': ['warn', {
        allow: ['warn', 'error', 'debug'],
      }],
      '@typescript-eslint/no-explicit-any': 'off', // No strict typing (annoying especially with React elements and events callbacks)"
      'consistent-return': 'warn', // https://eslint.org/docs/latest/rules/consistent-return
      'prefer-arrow-callback': ['warn'],
      'object-curly-spacing': ['warn', 'always'], // enforce consistent spacing inside braces
      'func-style': 'off', // function expressions or arrow functions are equally valid
      'no-unneeded-ternary': 'warn', // disallow unnecessary ternary expressions
      // React rules: https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules
      'react/prop-types': 'off', // PropTypes are not forced
      'react/forbid-prop-types': 'off', // all PropTypes are allowed
      'react-hooks/rules-of-hooks': 'error', // https://react.dev/reference/rules/rules-of-hooks
      'react-hooks/exhaustive-deps': 'warn', // Hooks dependency array, sometimes it's better to ignore
    },
  },
  {
    ...stylistic.configs.customize({
      indent: 2,
      quotes: 'single',
      semi: true,
      jsx: true,
    }),
  },
);
